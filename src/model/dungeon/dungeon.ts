import { DataManager } from "model/dataManager";
import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { EpilogueRoom } from "model/dungeon/epilogueRoom";
import { Room } from "model/dungeon/room";
import { TrainingRoom } from "model/dungeon/trainingRoom";
import { PartyCard } from "model/partyCard/partyCard";

import { JSONValue, isObject, isArray } from "utilities/jsonUtils";

export class Dungeon {
	readonly rooms: Room[][];

	restoreFromArchive(archive: JSONValue | undefined) {
		if (!isObject(archive)) {
			return;
		}

		const roomArchive = archive["rooms"];
		if (!isArray(roomArchive)) {
			return;
		}

		this.rooms.forEach((position, positionIndex) => {
			const positionArchive = roomArchive[positionIndex];
			if (!isArray(positionArchive)) {
				return;
			}

			position.forEach((option, optionIndex) => {
				option.restoreFromArchive(positionArchive[optionIndex]);
			});
		});
	}

	toJSON(): any {
		return {
			rooms: this.rooms
		};
	}

	get dataVersion(): string {
		return "";
	}

	get eventPasswords(): Record<Difficulty, string> {
		return {
			[Difficulty.normal]: "",
			[Difficulty.hardcore]: "",
			[Difficulty.nightmare]: "",
			[Difficulty.epic]: ""
		};
	}

	get timezoneOffset(): number {
		return 0;
	}
	get recapVideoLength(): number | undefined {
		return undefined;
	}
	get introVideoLength(): number {
		return 0;
	}

	constructor(dataManager: DataManager, rooms: Room[][] = []) {
		this.rooms = [
			[new TrainingRoom(dataManager)],
			...rooms,
			[new EpilogueRoom(dataManager)]
		];
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
