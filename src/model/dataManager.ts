import { ResetLevel } from "model/attributes/resetLevel";
import { Dungeon } from "model/dungeon/dungeon";
import { Room } from "model/dungeon/room";
import { PartyCard } from "model/partyCard/partyCard";

const storageKey = "data";

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
		}
	}

	save() {
		localStorage.setItem(storageKey, JSON.stringify({
			dungeon: this.dungeon,
			partyCard: this.partyCard,
			currentRoom: this.currentRoomIndex
		}));
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
