import { ReactNode } from "react";

import { Monster } from "model/dungeon/monster";

import { PartyCard } from "model/partyCard/partyCard";
import { Player } from "model/partyCard/player";

import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";

import { RoomAction } from "model/roomAction/roomAction";

import { DefaultMap } from "utilities/defaultMap";

export const roomTimeDuration = 12 * 60 * 1000;

export class Room {
	readonly name: string;
	readonly id: string;

	private _difficulty = Difficulty.normal;
	get difficulty(): Difficulty {
		return this._difficulty;
	}
	set difficulty(newValue: Difficulty) {
		this._difficulty = newValue;

		this.monsters.forEach((monster) => {
			monster.difficulty = newValue
		});
	}

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

	get actions(): RoomAction[] {
		return [];
	}

	get monsters(): Monster[] {
		return [];
	}

	defaultTargetForPlayer(player: Player): Monster {
		let targets = this.monsters.filter((monster) => {
			return monster.isAlive;
		});
		if (targets.length === 0) {
			targets = this.monsters;
		}
		return targets[0];
	}

	get infoColumnNotes(): ReactNode {
		return false;
	}

	get secondaryColumnNotes(): ReactNode {
		return false;
	}

	get mainSectionNotes(): ReactNode {
		return false;
	}

	reset(level: ResetLevel, party: PartyCard) {
		this.monsters.forEach((monster) => {
			monster.reset(level);
		})
	}

	prepareForParty(partyCard: PartyCard) {}

	statusForPlayer(player: Player): string {
		return "";
	}
}
