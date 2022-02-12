import { SaveType } from "model/attributes/saveType";
import { RollType } from "model/diceRoller/rollType";
import { SettingsChangeSocketResponse } from "model/diceRoller/socket/socketResponseMessage";

export type RollState = DisabledRollState | AcceptRollState | RevealRollState | ShowSlotIdRollState;

interface DisabledRollState {
	type: "disabled";
}

interface AcceptRollState {
	type: "accept";
	rollType: RollType;
}

interface RevealRollState {
	type: "reveal";
	rollType: RollType;
	complete: boolean;
}

interface ShowSlotIdRollState {
	type: "showSlotId";
}

export class RawRollState {
	private rollState = "disabled";
	private roll: string | undefined = undefined;
	private reveal: string | undefined = undefined;
	private saveRollType: string | undefined = undefined;
	private showSlotIdInOBS = false;

	updateWith(update: SettingsChangeSocketResponse) {
		this.rollState = update.rollState || this.rollState;
		this.roll = update.roll || this.roll;
		this.reveal = update.reveal || this.reveal;
		this.saveRollType = update.saveRollType || this.saveRollType;
		this.showSlotIdInOBS = update.showSlotIdInOBS !== undefined ? update.showSlotIdInOBS : this.showSlotIdInOBS;
	}

	get state(): RollState | undefined {
		switch (this.rollState) {
			case "disabled":
				return {
					type: this.showSlotIdInOBS ? "showSlotId" : "disabled"
				};
			case "accept":
				if (this.rollType) {
					return {
						type: "accept",
						rollType: this.rollType
					};
				}
				return undefined;
			case "reveal":
				if (this.rollType && this.revealComplete !== undefined) {
					return {
						type: "reveal",
						rollType: this.rollType,
						complete: this.revealComplete
					};
				}
				return undefined;
		}
		return undefined;
	}

	private get rollType(): RollType | undefined {
		switch (this.roll) {
			case "initiative_roll":
				return {
					type: "initiative"
				};
			case "attack_roll":
				return {
					type: "attack"
				};
			case "save_roll":
				if (this.saveType) {
					return {
						type: "save",
						save: this.saveType
					};
				}
				return undefined;
			default:
				return undefined;
		}
	}

	private get saveType(): SaveType | undefined {
		switch (this.saveRollType) {
			case "fortitude":
				return SaveType.fortitude;
			case "reflex":
				return SaveType.reflex;
			case "will":
				return SaveType.will;
			default:
				return undefined;
		}
	}

	private get revealComplete(): boolean | undefined {
		switch (this.reveal) {
			case "instantly":
				return true;
			case "next":
				return false;
			default:
				return undefined;
		}
	}
}
