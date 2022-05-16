import { ReactNode } from "react";

import { DataManager } from "model/dataManager";
import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { Monster } from "model/dungeon/monster";
import { StatBlock, StatBlockItem } from "model/dungeon/statBlock";
import { PartyCard } from "model/partyCard/partyCard";
import { Player } from "model/partyCard/player";
import { PlayerAttack } from "model/playerAttack/playerAttack";
import { RoomAction } from "model/roomAction/roomAction";

import { DefaultMap } from "utilities/defaultMap";
import { JSONValue, validate, optional, isObject } from "utilities/jsonUtils";

export const initiativeStatBlockId = "room initiative values";
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
	idIsStandalone?: boolean | undefined;
	pushDamageType?: string | undefined;
	hasInfoColumn?: boolean | undefined;
	hideRoomTimer?: boolean | undefined;
	hideDefaultPushDamage?: boolean | undefined;
	hasRogueTreasure?: boolean | undefined;
	statBlocks?: StatBlock[] | undefined;
	tokensOfInterest?: ItemOfInterest[] | undefined;
	spellsOfInterest?: ItemOfInterest[] | undefined;
}

export class Room {

	/* basic data */

	readonly dataManager: DataManager;

	readonly name: string;
	readonly id: string;
	readonly idIsStandalone: boolean;

	private initiativeValues: StatBlockItem | undefined;
	get initiativeBonus(): number {
		return this.initiativeValues?.numericValue ?? 0;
	}
	initiativeWinner: InitiativeWinner | undefined = undefined;

	private pushDamageType: string;
	get pushDamage(): string {
		if (this.pushDamageType) {
			return `${pushDamage.get(this.dataManager.difficulty)} ${this.pushDamageType}`;
		}
		return `${pushDamage.get(this.dataManager.difficulty)}`;
	}

	readonly hasInfoColumn: boolean;
	readonly hideRoomTimer: boolean;
	readonly hideDefaultPushDamage: boolean;

	readonly hasRogueTreasure: boolean;
	rogueTookTreasure = false;

	readonly statBlocks: StatBlock[];
	readonly tokensOfInterest: ItemOfInterest[];
	readonly spellsOfInterest: ItemOfInterest[];

	/* lifecycle */

	constructor(params: RoomConstructorParams) {
		this.dataManager = params.dataManager;

		this.name = params.name;
		this.id = params.id;
		this.idIsStandalone = params.idIsStandalone ?? false;

		this.pushDamageType = params.pushDamageType ?? "";

		this.hasInfoColumn = params.hasInfoColumn ?? true;
		this.hideRoomTimer = params.hideRoomTimer ?? false;
		this.hideDefaultPushDamage = params.hideDefaultPushDamage ?? false;

		this.hasRogueTreasure = params.hasRogueTreasure ?? false;

		this.statBlocks = params.statBlocks ?? [];
		this.tokensOfInterest = params.tokensOfInterest ?? [];
		this.spellsOfInterest = params.spellsOfInterest ?? [];

		this.initiativeValues = this.statBlocks.reduce((item: StatBlockItem | undefined, statBlock) => {
			return item ?? statBlock.get(initiativeStatBlockId);
		}, undefined);
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

	defaultTargetForPlayer(player: Player): Monster {
		let targets = this.monsters.filter((monster) => {
			return monster.isAlive;
		});
		if (targets.length === 0) {
			targets = this.monsters;
		}
		return targets[0];
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

export const pushDamage = new DefaultMap(0, {
	[Difficulty.normal]: 6,
	[Difficulty.hardcore]: 9,
	[Difficulty.nightmare]: 15,
	[Difficulty.epic]: 24
});
