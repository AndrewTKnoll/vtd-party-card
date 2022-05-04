import { Difficulty, allDifficulties } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { DiceRoller } from "model/diceRoller/diceRoller";
import { Dungeon } from "model/dungeon/dungeon";
import { Room } from "model/dungeon/room";
import { Log } from "model/log/log";
import { PartyCard } from "model/partyCard/partyCard";

import { validate, optional, isObject, isArray } from "utilities/jsonUtils";

const storageKey = "data";
const timezoneOffsetScale = 60 * 1000;

export class DataManager {
	readonly log: Log;

	readonly dungeon: Dungeon;
	readonly partyCard = new PartyCard();
	readonly diceRoller: DiceRoller;

	private currentRoomIndex: [number, number] = [0, 0];
	get currentRoom(): Room {
		return this.dungeon.rooms[this.currentRoomIndex[0]][this.currentRoomIndex[1]];
	}
	set currentRoom(newRoom: Room) {
		let newPosition = 0;
		let newOption = 0;

		this.dungeon.rooms.forEach((position, positionIndex) => {
			const optionIndex = position.indexOf(newRoom);
			if (optionIndex >= 0) {
				newPosition = positionIndex;
				newOption = optionIndex;
			}
		});

		this.currentRoomIndex = [newPosition, newOption];
	}
	get currentRoomPosition(): number {
		return this.currentRoomIndex[0];
	}

	difficulty = Difficulty.normal;

	private _startTime: Date | undefined = undefined;
	get startTime(): Date | undefined {
		return this._startTime;
	}

	get utcOffsetStartTime(): Date | undefined {
		if (!this.startTime) {
			return undefined;
		}
		return new Date(this.startTime.getTime() - this.dungeon.timezoneOffset * timezoneOffsetScale);
	}

	get localOffsetStartTime(): Date | undefined {
		if (!this.startTime) {
			return undefined;
		}

		const offset = this.dungeon.timezoneOffset - this.startTime.getTimezoneOffset();
		return new Date(this.startTime.getTime() - (offset * timezoneOffsetScale));
	}

	set localOffsetStartTime(newValue: Date | undefined) {
		if (!newValue) {
			this._startTime = undefined;
			return;
		}

		const offset = this.dungeon.timezoneOffset - newValue.getTimezoneOffset();
		this._startTime = new Date(newValue.getTime() + (offset * timezoneOffsetScale));
	}

	get skillTestLinks(): string[] {
		return [
			"https://truedungeon.com/files/Bard_Skill_Test.pdf",
			"https://truedungeon.com/files/Cleric_Skill_Test.pdf",
			"https://truedungeon.com/files/Druid_Skill_Test.pdf",
			"https://truedungeon.com/files/Wizard_Skill_Test.pdf"
		];
	}

	get preEventChecklistItems(): string[] {
		return [
			"Difficulty set?",
			"Party card filled out?",
			"Bard instrument set?",
			"Initiative tzar selected?",
			"Paladin default guard?",
			"Strict horn reminder",
			"Adventure codeword entered?",
			"Dice roller codeword entered?",
			"Remember to move rooms"
		];
	}

	constructor() {
		this.log = new Log(this);

		this.dungeon = new Dungeon(this);
		this.diceRoller = new DiceRoller(this.log);

		const archive = localStorage.readJSON(storageKey);

		if (!isObject(archive)) {
			return;
		}

		this.dungeon.restoreFromArchive(archive["dungeon"]);
		this.partyCard.restoreFromArchive(archive["partyCard"]);
		this.diceRoller.restoreFromArchive(archive["diceRoller"]);

		const currentRoomArchive = archive["currentRoom"];
		if (isArray(currentRoomArchive)) {
			this.currentRoomIndex[0] = validate(currentRoomArchive[0], this.currentRoomIndex[0]);
			this.currentRoomIndex[1] = validate(currentRoomArchive[1], this.currentRoomIndex[1]);

			if (this.currentRoomIndex[0] >= this.dungeon.rooms.length) {
				this.currentRoomIndex[0] = 0;
			}

			if (this.currentRoomIndex[1] >= this.dungeon.rooms[this.currentRoomIndex[0]].length) {
				this.currentRoomIndex[1] = 0;
			}
		}

		this.difficulty = validate(archive["difficulty"], this.difficulty, allDifficulties);

		const startTimeArchive = optional("number", archive["startTime"], this.startTime?.getTime());
		this._startTime = startTimeArchive ? new Date(startTimeArchive) : undefined;
	}

	save() {
		localStorage.writeJSON(storageKey, {
			dungeon: this.dungeon,
			partyCard: this.partyCard,
			diceRoller: this.diceRoller,
			currentRoom: this.currentRoomIndex,
			difficulty: this.difficulty,
			startTime: this.startTime?.getTime()
		});
	}

	reset(level: ResetLevel) {
		this.dungeon.reset(level, this.partyCard);
		this.partyCard.reset(level);

		if (level < ResetLevel.full) {
			return;
		}

		this.currentRoomIndex = [0, 0];
		this.difficulty = Difficulty.normal;
		this._startTime = undefined;
		this.diceRoller.slotId = undefined;

		this.log.clearLog();
	}

	prepareForParty() {
		this.dungeon.prepareForParty(this.partyCard);
	}
}
