import { Room } from "model/dungeon/room";

import { PartyCard } from "model/partyCard/partyCard";

import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";

export class Dungeon {
	readonly rooms: Room[] = [
		new Room("Room 1", "1"),
		new Room("Room 2", "2")
	];
	private currentRoomIndex = 0;
	get currentRoom(): Room {
		return this.rooms[this.currentRoomIndex];
	}
	set currentRoom(newRoom: Room) {
		this.currentRoomIndex = this.rooms.indexOf(newRoom);
	}

	private _difficulty = Difficulty.normal;
	get difficulty(): Difficulty {
		return this._difficulty;
	}
	set difficulty(newValue: Difficulty) {
		this._difficulty = newValue;

		this.rooms.forEach((room) => {
			room.difficulty = newValue;
		})
	}

	restoreFromArchive(archive: any) {
		this.currentRoomIndex = archive.currentRoom;
		this.difficulty = archive.difficulty;

		this.rooms.forEach((room, index) => {
			room.restoreFromArchive(archive.rooms[index]);
		});
	}

	toJSON(): any {
		return {
			difficulty: this.difficulty,
			rooms: this.rooms,
			currentRoom: this.currentRoomIndex
		};
	}

	reset(level: ResetLevel, party: PartyCard) {
		this.rooms.forEach((room) => {
			room.reset(level, party);
		});

		if (level < ResetLevel.full) {
			return;
		}

		this.currentRoomIndex = 0;
		this.difficulty = Difficulty.normal;
	}

	prepareForParty(partyCard: PartyCard) {
		this.rooms.forEach((room) => {
			room.prepareForParty(partyCard);
		});
	}
}
