import { RollType } from "model/diceRoller/rollType";

const endpointUrl = "https://us-central1-tdroller-1ac5a.cloudfunctions.net/gm";

export class DiceRoller {
	authToken: string | undefined = undefined;
	slotId: string | undefined = undefined;

	private errorCallback: (error: string) => void;

	constructor(errorCallback: (error: string) => void) {
		this.errorCallback = errorCallback;
	}

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
