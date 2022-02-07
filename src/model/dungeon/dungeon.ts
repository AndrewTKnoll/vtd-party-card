import { Room } from "model/dungeon/room";

import { PartyCard } from "model/partyCard/partyCard";

import { ResetLevel } from "model/attributes/resetLevel";

export class Dungeon {
	readonly rooms: Room[] = [
		new Room("Room 1", "1"),
		new Room("Room 2", "2")
	];

	restoreFromArchive(archive: any) {
		this.rooms.forEach((room, index) => {
			room.restoreFromArchive(archive.rooms[index]);
		});
	}

	toJSON(): any {
		return {
			rooms: this.rooms
		};
	}

	reset(level: ResetLevel, party: PartyCard) {
		this.rooms.forEach((room) => {
			room.reset(level, party);
		});
	}

	prepareForParty(partyCard: PartyCard) {
		this.rooms.forEach((room) => {
			room.prepareForParty(partyCard);
		});
	}
}
