import { Room } from "model/dungeon/room";

import { PartyCard } from "model/partyCard/partyCard";

import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";

export class Dungeon {
	readonly rooms: Room[] = [
		new Room("Room 1", "1"),
		new Room("Room 2", "2")
	];

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
		this.difficulty = archive.difficulty;

		this.rooms.forEach((room, index) => {
			room.restoreFromArchive(archive.rooms[index]);
		});
	}

	toJSON(): any {
		return {
			difficulty: this.difficulty,
			rooms: this.rooms
		};
	}

	reset(level: ResetLevel, party: PartyCard) {
		this.rooms.forEach((room) => {
			room.reset(level, party);
		});

		if (level < ResetLevel.full) {
			return;
		}

		this.difficulty = Difficulty.normal;
	}

	prepareForParty(partyCard: PartyCard) {
		this.rooms.forEach((room) => {
			room.prepareForParty(partyCard);
		});
	}
}
