import { Roll, rollFromUpdate } from "model/diceRoller/roll";
import { RollState, RawRollState } from "model/diceRoller/rollState";
import { RollType } from "model/diceRoller/rollType";
import { SocketRequestMessage } from "model/diceRoller/socket/socketRequestMessage";
import { SocketResponseMessage, SettingsChangeSocketResponse, RollChangeData } from "model/diceRoller/socket/socketResponseMessage";
import { SocketWrapper } from "model/diceRoller/socket/socketWrapper";
import { Log } from "model/log/log";

import { CallbackRegistry } from "utilities/callbackRegistry";
import { JSONValue, optional, isObject } from "utilities/jsonUtils";

const authTokenStorageKey = "diceRollerAuthToken";

const endpointUrl = "https://us-central1-tdroller-1ac5a.cloudfunctions.net/gm";
const socketUrl = "wss://s-usc1f-nss-2561.firebaseio.com/.ws?v=5&ns=tdroller-1ac5a-default-rtdb";
const socketSdk = "sdk.js.9-4-1";

export class DiceRoller {
	private log: Log;

	private socket!: SocketWrapper;

	private _authToken: string | undefined = undefined;
	get authToken(): string | undefined {
		return this._authToken;
	}
	set authToken(newValue: string | undefined) {
		this._authToken = newValue;

		if (newValue) {
			sessionStorage.setItem(authTokenStorageKey, newValue);
		}
		else {
			sessionStorage.removeItem(authTokenStorageKey);
		}
	}

	private _slotId: string | undefined = undefined;
	get slotId(): string | undefined {
		return this._slotId;
	}
	set slotId(newValue: string | undefined) {
		this.listenToSlot(false);
		this._slotId = newValue;
		this.listenToSlot(true);

		if (!this._slotId) {
			this.handleStateMessage();
		}
	}

	rolls: Roll[] = [];

	private rawRollState = new RawRollState();
	private _rollState: RollState = {
		type: "disabled"
	};
	get rollState(): RollState {
		return this._rollState;
	}

	readonly stateCallbacks = new CallbackRegistry<() => void>();
	readonly rollCallbacks = new CallbackRegistry<(roll: Roll) => void>();
	readonly errorCallbacks = new CallbackRegistry<(error: string, auth: boolean) => void>();

	constructor(log: Log) {
		this.log = log;

		this._authToken = sessionStorage.getItem(authTokenStorageKey) ?? undefined;

		this.reconnect();
	}

	restoreFromArchive(archive: JSONValue | undefined) {
		if (!isObject(archive)) {
			return;
		}

		this.slotId = optional("string", archive["slotId"], this.slotId);
	}

	toJSON(): any {
		return {
			slotId: this.slotId
		};
	}

	/* socket management */

	reconnect() {
		this.socket?.close();

		this.socket = new SocketWrapper(socketUrl, this.socketMessage.bind(this), this.socketError.bind(this));
		this.socket.send(SocketRequestMessage.sdk(socketSdk));

		this.listenToSlot(true);
	}

	private listenToSlot(listen: boolean) {
		if (this.slotId) {
			this.socket.send(SocketRequestMessage.listen(listen, "settings", this.slotId));
			this.socket.send(SocketRequestMessage.listen(listen, "rolls", this.slotId));
		}
	}

	private socketError(error: string, notify: boolean) {
		if (notify) {
			this.errorCallbacks.trigger(error, false);
		}
		this.reconnect();
	}

	private socketMessage(message: SocketResponseMessage) {
		switch (message.type) {
			case "settings":
				this.handleStateMessage(message);
				break;
			case "roll":
				if (message.clear) {
					this.rolls = [];
					this.stateCallbacks.trigger();
				}
				message.rolls.forEach(this.handleRollMessage.bind(this));
		}
	}

	private handleStateMessage(update?: SettingsChangeSocketResponse) {
		const oldState = {
			...this.rawRollState
		};

		if (update) {
			this.rawRollState.updateWith(update);
		}
		else {
			this.rawRollState = new RawRollState();
		}

		if (this.rawRollState.state) {
			this._rollState = this.rawRollState.state;
			this.stateCallbacks.trigger();
		}
		else {
			this.errorCallbacks.trigger("Dice roller is in an unexpected state - suggest reloading the page", false);
		}

		this.log.log("dice roller state change", {
			old: oldState,
			update: update,
			new: this.rawRollState.state
		});
	}

	private handleRollMessage(rollChange: RollChangeData) {
		if (rollChange.slotId !== this.slotId) {
			return;
		}

		const newRolls: Roll[] = [];

		rollChange.rolls.forEach((rollData, index) => {
			const roll = rollFromUpdate(rollChange, rollData, index);
			if (roll === undefined) {
				return;
			}
			newRolls.push(roll);
			this.rolls.push(roll);
			this.rollCallbacks.trigger(roll);
		});

		this.log.log("dice roller roll message", {
			raw: rollChange,
			parsed: newRolls
		});
	}

	/* commands */

	async logIn(password: string) {
		if (this.authToken) {
			this.errorCallbacks.trigger("Already logged in", false);
			return;
		}

		const response = await this.makeRequest({
			action: "login",
			password: password
		});

		if (response.authToken) {
			this.authToken = response.authToken;
		}
		else if (response.error) {
			this.errorCallbacks.trigger(response.error, false);
		}
	}

	async acceptRolls(rollType: RollType) {
		await this.sendCommand((slotId, authToken) => {
			return {
				action: "acceptRolls",
				authToken: authToken,
				slotId: slotId,
				roll: `${rollType.type}_roll`,
				saveRollType: (rollType.type === "save" ? rollType.save : undefined)
			};
		});
	}

	async revealRolls(instant: boolean) {
		await this.sendCommand((slotId, authToken) => {
			return {
				action: "revealRolls",
				authToken: authToken,
				slotId: slotId,
				reveal: (instant ? "instantly" : "next")
			};
		});
	}

	async resetRolls() {
		await this.sendCommand((slotId, authToken) => {
			return {
				action: "resetRolls",
				authToken: authToken,
				slotId: slotId
			};
		});
	}

	async showSlotIdInOBS(visible: boolean) {
		await this.sendCommand((slotId, authToken) => {
			return {
				action: "showSlotIdInOBS",
				authToken: authToken,
				slotId: slotId,
				show: visible
			};
		});
	}

	private async sendCommand(generator: (slotId: string, authToken: string) => CommandRequest) {
		if (!this.slotId) {
			this.errorCallbacks.trigger("No slot ID", false);
			return;
		}
		if (!this.authToken) {
			this.errorCallbacks.trigger("Not logged in", true);
			return;
		}

		try {
			const response = await this.makeRequest(generator(this.slotId, this.authToken));
			if (response.error) {
				this.errorCallbacks.trigger("Error with the dice roller - try logging in again", true);
			}
		}
		catch (error) {
			this.errorCallbacks.trigger("Error with the dice roller - try logging in again", true);
		}
	}

	private async makeRequest(request: CommandRequest): Promise<CommandResponse> {
		const response = await fetch(endpointUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(request)
		});

		return response.json();
	}
}

type CommandRequest = LoginRequest | AcceptRollRequest | RevealRollsRequest | ResetRollsRequest | ShowSlotRequest;

interface LoginRequest {
	action: "login";
	password: string;
}

interface AcceptRollRequest {
	action: "acceptRolls";
	authToken: string;
	slotId: string;

	roll: `${"initiative" | "attack" | "save"}_roll`;
	saveRollType: "fortitude" | "reflex" | "will" | undefined;
}

interface RevealRollsRequest {
	action: "revealRolls";
	authToken: string;
	slotId: string;

	reveal: "instantly" | "next";
}

interface ResetRollsRequest {
	action: "resetRolls";
	authToken: string;
	slotId: string;
}

interface ShowSlotRequest {
	action: "showSlotIdInOBS";
	authToken: string;
	slotId: string;

	show: boolean;
}

interface CommandResponse {
	readonly action: string;
	readonly success: boolean;
	readonly error?: string | undefined;
	readonly authToken?: string | undefined;
}
