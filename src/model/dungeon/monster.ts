import { DataManager } from "model/dataManager";
import { DamageType } from "model/attributes/damageType";
import { ResetLevel } from "model/attributes/resetLevel";
import { StatBlockItem } from "model/dungeon/statBlock";
import { Class } from "model/partyCard/class";
import { Player } from "model/partyCard/player";
import { PlayerAttackCritMultiplier } from "model/playerAttack/playerAttackCritMultiplier";
import { PlayerAttackType } from "model/playerAttack/playerAttackType";

import { DefaultMap } from "utilities/defaultMap";
import { JSONValue, validate, isObject } from "utilities/jsonUtils";

export interface DamageDescription {
	readonly type: PlayerAttackType;
	readonly player: Player;
	readonly amount: number;
	readonly multiplier: PlayerAttackCritMultiplier;
	readonly damageType: DamageType | undefined;
	readonly aoe: boolean;
}

export interface RetributionDamageDescription {
	readonly type: "retribution";
	readonly player: Player;
	readonly amount: number;
}

export class Monster {
	readonly dataManager: DataManager;

	readonly name: string;

	protected roundDamageFromPlayers = new DefaultMap<Class, number>(0);
	protected totalDamageFromPlayers = new DefaultMap<Class, number>(0);

	private _currentDamage = 0;
	get currentDamage(): number {
		return this._currentDamage;
	}
	set currentDamage(newValue: number) {
		this._currentDamage = newValue < 0 ? 0 : newValue;
	}

	readonly maxHPValues: StatBlockItem;
	get maxHP(): number {
		return this.maxHPValues.numericValue;
	}

	get isAlive(): boolean {
		return this.currentDamage < this.maxHP;
	}

	isTaunted = false;
	get isTauntable(): boolean {
		return true;
	}

	constructor(dataManager: DataManager, name: string, maxHP: StatBlockItem) {
		this.dataManager = dataManager;

		this.name = name;
		this.maxHPValues = maxHP;
	}

	restoreFromArchive(archive: JSONValue | undefined) {
		if (!isObject(archive)) {
			return;
		}

		this.roundDamageFromPlayers.restoreFromArchive(archive["roundDamageFromPlayers"]);
		this.totalDamageFromPlayers.restoreFromArchive(archive["totalDamageFromPlayers"]);
		this.currentDamage = validate(archive["currentDamage"], this.currentDamage);
		this.isTaunted = validate(archive["isTaunted"], this.isTaunted);
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

export class SharedHealthMonster extends Monster {
	private sharedHealth: Monster;

	override get currentDamage(): number {
		return this.sharedHealth.currentDamage;
	}
	override set currentDamage(newValue: number) {
		this.sharedHealth.currentDamage = newValue;
	}

	override get maxHP(): number {
		return this.sharedHealth.maxHP;
	}

	constructor(name: string, sharedHealth: Monster) {
		super(sharedHealth.dataManager, name, sharedHealth.maxHPValues);

		this.sharedHealth = sharedHealth;
	}

	override reset(level: ResetLevel) {
		super.reset(level);
		this.sharedHealth.reset(level);
	}

	override takeDamage(damage: DamageDescription | RetributionDamageDescription) {
		this.sharedHealth.takeDamage(damage);
		this.roundDamageFromPlayers.set(damage.player.class, this.roundDamageFromPlayers.get(damage.player.class) + damage.amount);
		this.totalDamageFromPlayers.set(damage.player.class, this.totalDamageFromPlayers.get(damage.player.class) + damage.amount);
	}
}
