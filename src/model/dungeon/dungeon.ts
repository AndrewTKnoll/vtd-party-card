import { DataManager } from "model/dataManager";
import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { EpilogueRoom } from "model/dungeon/epilogueRoom";
import { Room } from "model/dungeon/room";
import { TrainingRoom } from "model/dungeon/trainingRoom";
import { PartyCard } from "model/partyCard/partyCard";

import { JSONValue, isObject, isArray } from "utilities/jsonUtils";

interface DungeonConstructorParams {
	dataManager: DataManager;
	dataVersion: string;
	rooms: Room[][];
	eventPasswords: Record<Difficulty, string>;
	timezoneOffset: number;
	recapVideoLength?: number | undefined;
	introVideoLength: number;
}

export class Dungeon {
	readonly dataVersion: string;
	readonly rooms: Room[][];
	readonly eventPasswords: Record<Difficulty, string>;
	readonly timezoneOffset: number;
	readonly recapVideoLength: number | undefined;
	readonly introVideoLength: number;

	constructor(params: DungeonConstructorParams) {
		this.dataVersion = params.dataVersion;

		this.rooms = [
			[new TrainingRoom(params.dataManager)],
			...params.rooms,
			[new EpilogueRoom(params.dataManager)]
		];

		this.eventPasswords = params.eventPasswords;
		this.timezoneOffset = params.timezoneOffset;
		this.recapVideoLength = params.recapVideoLength;
		this.introVideoLength = params.introVideoLength;
	}

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
