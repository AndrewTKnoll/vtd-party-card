import { ReactNode } from "react";

import { Monster } from "model/dungeon/monster";

import { PartyCard } from "model/partyCard/partyCard";
import { Player } from "model/partyCard/player";

import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";

import { RoomAction } from "model/roomAction/roomAction";

import { DefaultMap } from "utilities/defaultMap";

export const roomTimeDuration = 12 * 60 * 1000;

export enum InitiativeWinner {
	players = "players",
	monster = "monster"
}

export function nameForInitiativeWinner(winner: InitiativeWinner): string {
	return winner.charAt(0).toUpperCase() + winner.slice(1);
}

export interface ItemOfInterest {
	readonly name: string;
	readonly description: ReactNode;
	readonly tokenDBLink?: string | undefined;
}

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
	initiativeWinner: InitiativeWinner | undefined = undefined;

	constructor(name: string, id: string, initiativeBonus?: { [key: string]: number }) {
		this.name = name;
		this.id = id;

		this.initiativeValues = new DefaultMap(0, initiativeBonus || {
			[Difficulty.hardcore]: 5,
			[Difficulty.nightmare]: 10,
			[Difficulty.epic]: 15
		});
	}

	restoreFromArchive(archive: any) {
		this.initiativeWinner = archive.initiativeWinner;
	}

	toJSON(): any {
		return {
			initiativeWinner: this.initiativeWinner
		};
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

	get hideDefaultPushDamage(): boolean {
		return false;
	}
	get pushDamage(): number {
		return pushDamage.get(this.difficulty);
	}

	get tokensOfInterest(): ItemOfInterest[] {
		return [];
	}

	get spellsOfInterest(): ItemOfInterest[] {
		return [];
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
		});

		if (level !== ResetLevel.full) {
			return;
		}

		this.initiativeWinner = undefined;
	}

	prepareForParty(partyCard: PartyCard) {}

	statusForPlayer(player: Player): string {
		return "";
	}
}

const pushDamage = new DefaultMap(0, {
	[Difficulty.normal]: 6,
	[Difficulty.hardcore]: 9,
	[Difficulty.nightmare]: 15,
	[Difficulty.epic]: 24
});
