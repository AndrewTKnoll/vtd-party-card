import { SaveType } from "model/attributes/saveType";
import { Player, WeaponType } from "model/partyCard/player";

export type MonsterAttack = MonsterWeaponAttack | MonsterSaveAttack;
export enum MonsterAttackType {
	weapon = "weapon",
	save = "save"
}

interface AutoHit {
	auto: true;
}
interface RollHit {
	auto: false;
	roll: number;
	total: number;
}
type HitType = AutoHit | RollHit;

export interface MonsterWeaponAttackParams {
	target: Player;
	paladin?: Player | undefined;
	weaponOverride?: WeaponType | undefined;
	hitBonus?: number | undefined;
	damageAmount: number;
	damageType: string;
	note?: string | undefined;
	completionHandler?: ((attack: MonsterWeaponAttack) => void) | undefined;
}

export class MonsterWeaponAttack {
	readonly type = MonsterAttackType.weapon;

	readonly target: Player;
	readonly paladin: Player | undefined;

	private weaponOverride: WeaponType | undefined;
	get effectiveWeapon(): WeaponType {
		return this.weaponOverride || (this.paladin || this.target).currentWeapon;
	}

	readonly hit: HitType;

	get effectiveAC(): number {
		const target = this.paladin || this.target;
		return (this.effectiveWeapon === WeaponType.melee ? target.meleeAC : target.rangedAC) + target.acAdjust;
	}

	get isHit(): boolean {
		if (this.hit.auto) {
			return true;
		}
		if (this.hit.roll === 20) {
			return true;
		}
		if (this.hit.roll === 1) {
			return false;
		}

		return this.hit.total >= this.effectiveAC;
	}

	readonly damageAmount: number;
	readonly damageType: string;

	readonly note: string;

	private completionHandler: ((attack: MonsterWeaponAttack) => void) | undefined;

	constructor(params: MonsterWeaponAttackParams) {
		if (typeof(params.hitBonus) === "number") {
			const roll = Math.floor(Math.random() * 20) + 1;
			this.hit = { auto: false, roll: roll, total: roll + params.hitBonus };
		}
		else {
			this.hit = { auto: true };
		}

		this.target = params.target;
		this.paladin = (params.paladin?.canGuard(params.target) ? params.paladin : undefined);
		this.weaponOverride = params.weaponOverride;
		this.damageAmount = params.damageAmount;
		this.damageType = params.damageType;

		this.note = params.note || "";

		this.completionHandler = params.completionHandler;
	}

	complete() {
		this.completionHandler?.(this);
	}
}

export enum MonsterSaveAttackResult {
	success = "success",
	failure = "failure"
}

export const allMonsterSaveAttackResults : MonsterSaveAttackResult[] = [
	MonsterSaveAttackResult.success,
	MonsterSaveAttackResult.failure
];

export function nameForMonsterSaveAttackResult(result: MonsterSaveAttackResult) {
	return result.charAt(0).toUpperCase() + result.slice(1);
}

export interface MonsterSaveAttackParams {
	target: Player;
	save: SaveType;
	successMessage: string;
	failureMessage: string;
	completionHandler?: ((attack: MonsterSaveAttack) => void) | undefined;
}

export class MonsterSaveAttack {
	readonly type = MonsterAttackType.save;

	readonly target: Player;
	readonly save: SaveType;

	result: MonsterSaveAttackResult | undefined = undefined;

	readonly successMessage: string;
	readonly failureMessage: string;

	private completionHandler: ((attack: MonsterSaveAttack) => void) | undefined;

	constructor(params: MonsterSaveAttackParams) {
		this.target = params.target;
		this.save = params.save;
		this.successMessage = params.successMessage;
		this.failureMessage = params.failureMessage;
		this.completionHandler = params.completionHandler;
	}

	complete() {
		this.completionHandler?.(this);
	}
}
