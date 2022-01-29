import { PartyCard } from "model/partyCard/partyCard";
import { Player } from "model/partyCard/player";

import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";

import { DefaultMap } from "utilities/defaultMap";

export class Room {
	readonly name: string;
	readonly id: string;

	difficulty = Difficulty.normal;

	private initiativeValues: DefaultMap<Difficulty, number>;
	get initiativeBonus(): number {
		return this.initiativeValues.get(this.difficulty);
	}

	constructor(name: string, id: string, initiativeBonus?: { [key: string]: number }) {
		this.name = name;
		this.id = id;

		this.initiativeValues = new DefaultMap(0, initiativeBonus || {
			[Difficulty.hardcore]: 5,
			[Difficulty.nightmare]: 10,
			[Difficulty.epic]: 15
		});
	}

	restoreFromArchive(archive: any) {}

	toJSON(): any {
		return {};
	}

	reset(level: ResetLevel) {}

	prepareForParty(partyCard: PartyCard) {}

	statusForPlayer(player: Player): string {
		return "";
	}
}
