import { SocketRequestMessage } from "model/diceRoller/socket/socketRequestMessage";
import { SocketResponseMessage } from "model/diceRoller/socket/socketResponseMessage";
import { SocketWrapper } from "model/diceRoller/socket/socketWrapper";
import { RollState, RawRollState } from "model/diceRoller/rollState";
import { RollType } from "model/diceRoller/rollType";

const endpointUrl = "https://us-central1-tdroller-1ac5a.cloudfunctions.net/gm";
const socketUrl = "wss://s-usc1c-nss-337.firebaseio.com/.ws?v=5&ns=tdroller-1ac5a-default-rtdb";
const socketSdk = "sdk.js.9-4-1";

export class DiceRoller {
	private socket!: SocketWrapper;

	authToken: string | undefined = undefined;
	private _slotId: string | undefined = undefined;
	get slotId(): string | undefined {
		return this._slotId;
	}
	set slotId(newValue: string | undefined) {
		this.listenToSlot(false);
		this._slotId = newValue;
		this.listenToSlot(true);
	}

	private rawRollState = new RawRollState();
	private _rollState: RollState = {
		type: "disabled"
	};
	get rollState(): RollState {
		return this._rollState;
	}

	private stateCallback: () => void;
	private errorCallback: (error: string) => void;

	constructor(stateCallback: () => void, errorCallback: (error: string) => void) {
		this.stateCallback = stateCallback;
		this.errorCallback = errorCallback;

		this.reconnect();
	}

	/* socket management */

	reconnect() {
		this.socket?.close();

		this.socket = new SocketWrapper(socketUrl, this.socketMessage.bind(this), this.errorCallback);
		this.socket.send(SocketRequestMessage.sdk(socketSdk));

		this.listenToSlot(true);
	}

	private listenToSlot(listen: boolean) {
		if (this.slotId) {
			this.socket.send(SocketRequestMessage.listen(listen, "settings", this.slotId));
			this.socket.send(SocketRequestMessage.listen(listen, "rolls", this.slotId));
		}
	}

	private socketMessage(message: SocketResponseMessage) {
		switch (message.type) {
			case "settings":
				this.rawRollState.updateWith(message);
				if (this.rawRollState.state) {
					this._rollState = this.rawRollState.state;
					this.stateCallback();
				}
				else {
					this.errorCallback(`Inconsistent state update\n\nCurrent:\n${JSON.stringify(this.rollState)}\n\nUpdate:\n${JSON.stringify(message)}`)
				}
				break;
		}
	}

	/* commands */

	async logIn(password: string) {
		if (this.authToken) {
			this.errorCallback("Already logged in");
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
			this.errorCallback(response.error);
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
			this.errorCallback("No slot ID");
			return;
		}
		if (!this.authToken) {
			this.errorCallback("Not logged in");
			return;
		}

		try {
			const response = await this.makeRequest(generator(this.slotId, this.authToken));
			if (response.error) {
				this.errorCallback(response.error);
			}
		}
		catch (error) {
			this.errorCallback(`${error}`);
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
