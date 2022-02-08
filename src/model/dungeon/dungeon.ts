import { Room } from "model/dungeon/room";

import { PartyCard } from "model/partyCard/partyCard";

import { ResetLevel } from "model/attributes/resetLevel";

export class Dungeon {
	readonly rooms: Room[][] = [];

	restoreFromArchive(archive: any) {
		this.rooms.forEach((position, positionIndex) => {
			position.forEach((option, optionIndex) => {
				option.restoreFromArchive(archive.rooms[positionIndex][optionIndex]);
			});
		});
	}

	toJSON(): any {
		return {
			rooms: this.rooms
		};
	}

	reset(level: ResetLevel, party: PartyCard) {
		this.rooms.forEach((position) => {
			position.forEach((option) => {
				option.reset(level, party);
			});
		});
	}

	prepareForParty(partyCard: PartyCard) {
		this.rooms.forEach((position) => {
			position.forEach((option) => {
				option.prepareForParty(partyCard);
			});
		});
	}
}
