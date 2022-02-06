import { ResetLevel } from "model/attributes/resetLevel";
import { Dungeon } from "model/dungeon/dungeon";
import { Room } from "model/dungeon/room";
import { PartyCard } from "model/partyCard/partyCard";

const dungeonStorageKey = "dungeon";
const partyCardStorageKey = "partyCard";
const currentRoomStorageKey = "currentRoom";

function readFromLocalStorage(key: string): any {
	try {
		const archive = localStorage.getItem(key);
		if (archive) {
			return JSON.parse(archive);
		}
	}
	catch (error) {
		return undefined;
	}
}

export class DataManager {
	readonly dungeon = new Dungeon();
	readonly partyCard = new PartyCard();

	private currentRoomIndex = 0;
	get currentRoom(): Room {
		return this.dungeon.rooms[this.currentRoomIndex];
	}
	set currentRoom(newRoom: Room) {
		this.currentRoomIndex = this.dungeon.rooms.indexOf(newRoom);
	}

	constructor() {
		const dungeonArchive = readFromLocalStorage(dungeonStorageKey);
		if (dungeonArchive) {
			this.dungeon.restoreFromArchive(dungeonArchive);
		}

		const partyCardArchive = readFromLocalStorage(partyCardStorageKey);
		if (partyCardArchive) {
			this.partyCard.restoreFromArchive(partyCardArchive);
		}

		const currentRoomArchive = readFromLocalStorage(currentRoomStorageKey);
		if (currentRoomArchive) {
			this.currentRoomIndex = currentRoomArchive;
		}
	}

	save() {
		localStorage.setItem(dungeonStorageKey, JSON.stringify(this.dungeon));
		localStorage.setItem(partyCardStorageKey, JSON.stringify(this.partyCard));
		localStorage.setItem(currentRoomStorageKey, JSON.stringify(this.currentRoomIndex));
	}

	reset(level: ResetLevel) {
		this.dungeon.reset(level, this.partyCard);
		this.partyCard.reset(level);

		if (level < ResetLevel.full) {
			return;
		}

		this.currentRoomIndex = 0;
	}
}
