import { DataManager } from "model/dataManager";
import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { EpilogueRoom } from "model/dungeon/epilogueRoom";
import { Room } from "model/dungeon/room";
import { PartyCard } from "model/partyCard/partyCard";

export class Dungeon {
	readonly rooms: Room[][];

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
