import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { Dungeon } from "model/dungeon/dungeon";
import { Room } from "model/dungeon/room";
import { PartyCard } from "model/partyCard/partyCard";

const storageKey = "data";

export class DataManager {
	readonly dungeon = new Dungeon();
	readonly partyCard = new PartyCard();

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

	constructor() {
		let archive = undefined;
		try {
			const archiveString = localStorage.getItem(storageKey);
			if (archiveString) {
				archive = JSON.parse(archiveString);
			}
		}
		catch (error) {}

		if (archive) {
			this.dungeon.restoreFromArchive(archive.dungeon);
			this.partyCard.restoreFromArchive(archive.partyCard);

			this.currentRoomIndex = archive.currentRoom;
			this.difficulty = archive.difficulty;
		}
	}

	save() {
		localStorage.setItem(storageKey, JSON.stringify({
			dungeon: this.dungeon,
			partyCard: this.partyCard,
			currentRoom: this.currentRoomIndex,
			difficulty: this._difficulty
		}));
	}

	reset(level: ResetLevel) {
		this.dungeon.reset(level, this.partyCard);
		this.partyCard.reset(level);

		if (level < ResetLevel.full) {
			return;
		}

		this.currentRoomIndex = [0, 0];
	}
}
