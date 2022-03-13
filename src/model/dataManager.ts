import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { DiceRoller } from "model/diceRoller/diceRoller";
import { Dungeon } from "model/dungeon/dungeon";
import { Log } from "model/log/log";
import { Room } from "model/dungeon/room";
import { PartyCard } from "model/partyCard/partyCard";

const storageKey = "data";

export class DataManager {
	readonly log = new Log();

	readonly dungeon: Dungeon = new Dungeon();
	readonly partyCard = new PartyCard();
	readonly diceRoller = new DiceRoller(this.log);

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

	private _difficulty = Difficulty.normal;
	get difficulty(): Difficulty {
		return this._difficulty;
	}
	set difficulty(newValue: Difficulty) {
		this._difficulty = newValue;

		this.dungeon.rooms.forEach((position) => {
			position.forEach((option) => {
				option.difficulty = newValue;
			});
		});
	}

	startTime: Date | undefined = undefined;

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
		try {
			const archiveString = localStorage.getItem(storageKey);
			if (!archiveString) {
				return;
			}
			const archive = JSON.parse(archiveString);

			this.dungeon.restoreFromArchive(archive.dungeon);
			this.partyCard.restoreFromArchive(archive.partyCard);

			this.currentRoomIndex = archive.currentRoom;
			this.difficulty = archive.difficulty;
			this.startTime = archive.startTime ? new Date(archive.startTime) : undefined;
			this.diceRoller.slotId = archive.slotId;

			const sessionArchiveString = sessionStorage.getItem(storageKey);
			if (!sessionArchiveString) {
				return;
			}
			const sessionArchive = JSON.parse(sessionArchiveString);

			this.diceRoller.authToken = sessionArchive.authToken;
		}
		catch (error) {
			this.reset(ResetLevel.full);
		}
	}

	save() {
		localStorage.setItem(storageKey, JSON.stringify({
			dungeon: this.dungeon,
			partyCard: this.partyCard,
			currentRoom: this.currentRoomIndex,
			difficulty: this._difficulty,
			startTime: this.startTime?.getTime(),
			slotId: this.diceRoller.slotId
		}));

		sessionStorage.setItem(storageKey, JSON.stringify({
			authToken: this.diceRoller.authToken
		}));
	}

	reset(level: ResetLevel) {
		this.dungeon.reset(level, this.partyCard);
		this.partyCard.reset(level);

		if (level < ResetLevel.full) {
			return;
		}

		this.currentRoomIndex = [0, 0];
		this.difficulty = Difficulty.normal;
		this.startTime = undefined;
		this.diceRoller.slotId = undefined;

		this.log.clearLog();
	}

	prepareForParty() {
		this.dungeon.prepareForParty(this.partyCard);
	}
}
