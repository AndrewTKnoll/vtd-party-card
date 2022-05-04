import { ReactNode } from "react";

import { DataManager } from "model/dataManager";
import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { Monster } from "model/dungeon/monster";
import { StatBlock } from "model/dungeon/statBlock";
import { PartyCard } from "model/partyCard/partyCard";
import { Player } from "model/partyCard/player";
import { PlayerAttack } from "model/playerAttack/playerAttack";
import { RoomAction } from "model/roomAction/roomAction";

import { DefaultMap } from "utilities/defaultMap";
import { JSONValue, validate, optional, isObject } from "utilities/jsonUtils";

export const roomTimeDuration = 12 * 60 * 1000;

export enum InitiativeWinner {
	players = "players",
	monster = "monster"
}

const allInitiativeWinners = [
	InitiativeWinner.players,
	InitiativeWinner.monster
];

export function nameForInitiativeWinner(winner: InitiativeWinner): string {
	return winner.charAt(0).toUpperCase() + winner.slice(1);
}

export interface ItemOfInterest {
	readonly name: string;
	readonly description: ReactNode;
	readonly tokenDBLink?: string | undefined;
}

export interface RoomTimer {
	readonly label: string;
	readonly timeOffset: number;
	readonly completeText: string;
}

interface RoomConstructorParams {
	dataManager: DataManager;
	name: string;
	id: string;
	idIsStandalone?: boolean;
	initiativeBonus?: { [key: string]: number};
	pushDamageType?: string;
	hasInfoColumn?: boolean;
	hideRoomTimer?: boolean;
	hideDefaultPushDamage?: boolean;
	hasRogueTreasure?: boolean;
}

export class Room {

	/* basic data */

	readonly dataManager: DataManager;

	readonly name: string;
	readonly id: string;
	readonly idIsStandalone: boolean;

	get difficulty(): Difficulty {
		return this.dataManager.difficulty;
	}

	private initiativeValues: DefaultMap<Difficulty, number>;
	get initiativeBonus(): number {
		return this.initiativeValues.get(this.difficulty);
	}
	initiativeWinner: InitiativeWinner | undefined = undefined;

	private pushDamageType: string;
	get pushDamage(): string {
		if (this.pushDamageType) {
			return `${pushDamage.get(this.difficulty)} ${this.pushDamageType}`;
		}
		return `${pushDamage.get(this.difficulty)}`;
	}

	readonly hasInfoColumn: boolean;
	readonly hideRoomTimer: boolean;
	readonly hideDefaultPushDamage: boolean;

	readonly hasRogueTreasure: boolean;
	rogueTookTreasure = false;

	/* lifecycle */

	constructor(params: RoomConstructorParams) {
		this.dataManager = params.dataManager;

		this.name = params.name;
		this.id = params.id;
		this.idIsStandalone = params.idIsStandalone ?? false;

		this.initiativeValues = new DefaultMap(0, params.initiativeBonus ?? {
			[Difficulty.hardcore]: 5,
			[Difficulty.nightmare]: 10,
			[Difficulty.epic]: 15
		});

		this.pushDamageType = params.pushDamageType ?? "";

		this.hasInfoColumn = params.hasInfoColumn ?? true;
		this.hideRoomTimer = params.hideRoomTimer ?? false;
		this.hideDefaultPushDamage = params.hideDefaultPushDamage ?? false;

		this.hasRogueTreasure = params.hasRogueTreasure ?? false;
	}

	restoreFromArchive(archive: JSONValue | undefined) {
		if (!isObject(archive)) {
			return;
		}

		this.initiativeWinner = optional("string", archive["initiativeWinner"], this.initiativeWinner, allInitiativeWinners);
		this.rogueTookTreasure = validate(archive["rogueTookTreasure"], this.rogueTookTreasure);
	}

	toJSON(): any {
		return {
			initiativeWinner: this.initiativeWinner,
			rogueTookTreasure: this.rogueTookTreasure
		};
	}

	/* data override points */

	get roomTimers(): RoomTimer[] {
		return [];
	}

	get actions(): RoomAction[] {
		return [];
	}

	get monsters(): Monster[] {
		return [];
	}

	get statBlocks(): StatBlock[] {
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

	get tokensOfInterest(): ItemOfInterest[] {
		return [];
	}

	get spellsOfInterest(): ItemOfInterest[] {
		return [];
	}

	infoColumnNotes(update: () => void): ReactNode {
		return false;
	}

	secondaryColumnNotes(update: () => void): ReactNode {
		return false;
	}

	mainSectionNotes(update: () => void): ReactNode {
		return false;
	}

	statusForPlayer(player: Player): string {
		return "";
	}

	/* event hooks */

	reset(level: ResetLevel, party: PartyCard) {
		this.monsters.forEach((monster) => {
			monster.reset(level);
		});

		if (level !== ResetLevel.full) {
			return;
		}

		this.initiativeWinner = undefined;
		this.rogueTookTreasure = false;
	}

	prepareForParty(partyCard: PartyCard) {}

	beforePlayerAttackCompletes(attack: PlayerAttack) {}
}

const pushDamage = new DefaultMap(0, {
	[Difficulty.normal]: 6,
	[Difficulty.hardcore]: 9,
	[Difficulty.nightmare]: 15,
	[Difficulty.epic]: 24
});
