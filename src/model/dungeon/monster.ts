import { DataManager } from "model/dataManager";
import { DamageType } from "model/attributes/damageType";
import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { Class } from "model/partyCard/class";
import { Player } from "model/partyCard/player";
import { PlayerAttackCritMultiplier } from "model/playerAttack/playerAttackCritMultiplier";
import { PlayerAttackType } from "model/playerAttack/playerAttackType";

import { DefaultMap } from "utilities/defaultMap";

interface DamageDescription {
	readonly type: PlayerAttackType;
	readonly player: Player;
	readonly amount: number;
	readonly multiplier: PlayerAttackCritMultiplier;
	readonly damageType: DamageType | undefined;
	readonly aoe: boolean;
}

interface RetributionDamageDescription {
	readonly type: "retribution";
	readonly player: Player;
	readonly amount: number;
}

export class Monster {
	private readonly dataManager: DataManager;

	readonly name: string;

	private roundDamageFromPlayers = new DefaultMap<Class, number>(0);
	private totalDamageFromPlayers = new DefaultMap<Class, number>(0);

	private _currentDamage = 0;
	get currentDamage(): number {
		return this._currentDamage;
	}
	set currentDamage(newValue: number) {
		this._currentDamage = newValue < 0 ? 0 : newValue;
	}

	private maxHPValues: DefaultMap<Difficulty, number>;
	get maxHP(): number {
		return this.maxHPValues.get(this.dataManager.difficulty);
	}

	get isAlive(): boolean {
		return this.currentDamage < this.maxHP;
	}

	isTaunted = false;
	get isTauntable(): boolean {
		return true;
	}

	constructor(dataManager: DataManager, name: string, maxHP: { [key: string]: number }) {
		this.dataManager = dataManager;

		this.name = name;
		this.maxHPValues = new DefaultMap(0, maxHP);
	}

	restoreFromArchive(archive: any) {
		this.roundDamageFromPlayers = new DefaultMap(0, archive.roundDamageFromPlayers.values);
		this.totalDamageFromPlayers = new DefaultMap(0, archive.totalDamageFromPlayers.values);
		this.currentDamage = archive.currentDamage;
		this.isTaunted = archive.isTaunted;
	}

	toJSON(): any {
		return {
			roundDamageFromPlayers: this.roundDamageFromPlayers,
			totalDamageFromPlayers: this.totalDamageFromPlayers,
			currentDamage: this.currentDamage,
			isTaunted: this.isTaunted
		};
	}

	reset(level: ResetLevel) {
		this.roundDamageFromPlayers = new DefaultMap(0);
		this.isTaunted = false;

		if (level < ResetLevel.full) {
			return;
		}

		this.currentDamage = 0;
		this.totalDamageFromPlayers = new DefaultMap(0);
	}

	get statusNote(): string {
		return "";
	}

	takeDamage(damage: DamageDescription | RetributionDamageDescription) {
		this.currentDamage += damage.amount;
		this.roundDamageFromPlayers.set(damage.player.class, this.roundDamageFromPlayers.get(damage.player.class) + damage.amount);
		this.totalDamageFromPlayers.set(damage.player.class, this.totalDamageFromPlayers.get(damage.player.class) + damage.amount);
	}

	damageFromPlayer(player: Player, roundOnly: boolean): number {
		return (roundOnly ? this.roundDamageFromPlayers : this.totalDamageFromPlayers).get(player.class);
	}

	getHighDamagePlayers(players: Player[], roundOnly: boolean): Player[] {
		return players.getHighValueItems((player) => {
			return this.damageFromPlayer(player, roundOnly);
		});
	}
}
