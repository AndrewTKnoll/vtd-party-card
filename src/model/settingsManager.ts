import { validate, isObject } from "utilities/jsonUtils";

const storageKey = "settings";

export class SettingsManager {
	private _roomActionAutomaticDiceRoller = true;
	get roomActionAutomaticDiceRoller(): boolean {
		return this._roomActionAutomaticDiceRoller;
	}
	set roomActionAutomaticDiceRoller(newValue: boolean) {
		this._roomActionAutomaticDiceRoller = newValue;
		this.save();
	}

	private _checkInitiativeBonus = true;
	get checkInitiativeBonus(): boolean {
		return this._checkInitiativeBonus;
	}
	set checkInitiativeBonus(newValue: boolean) {
		this._checkInitiativeBonus = newValue;
		this.save();
	}

	constructor() {
		const archive = localStorage.readJSON(storageKey);

		if (!isObject(archive)) {
			return;
		}

		this._roomActionAutomaticDiceRoller = validate(archive["roomActionAutomaticDiceRoller"], this._roomActionAutomaticDiceRoller);
		this._checkInitiativeBonus = validate(archive["checkInitiativeBonus"], this._checkInitiativeBonus);
	}

	private save() {
		localStorage.writeJSON(storageKey, {
			roomActionAutomaticDiceRoller: this._roomActionAutomaticDiceRoller,
			checkInitiativeBonus: this._checkInitiativeBonus
		});
	}
}
