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

	constructor(
		target: Player,
		paladin: Player | undefined,
		weaponOverride: WeaponType | undefined,
		hitBonus: number | undefined,
		damageAmount: number,
		damageType: string,
		note?: string | undefined,
		completionHandler?: ((attack: MonsterWeaponAttack) => void) | undefined
	) {
		if (typeof(hitBonus) === "number") {
			const roll = Math.floor(Math.random() * 20) + 1;
			this.hit = { auto: false, roll: roll, total: roll + hitBonus };
		}
		else {
			this.hit = { auto: true };
		}

		this.target = target;
		this.paladin = (paladin?.canGuard(target) ? paladin : undefined);
		this.weaponOverride = weaponOverride;
		this.damageAmount = damageAmount;
		this.damageType = damageType;

		this.note = (note ? ` ${note}` : "");

		this.completionHandler = completionHandler;
	}

	complete() {
		this.completionHandler?.(this);
	}
}

export enum MonsterSaveAttackResult {
	success = "success",
	failure = "failure"
}

export class MonsterSaveAttack {
	readonly type = MonsterAttackType.save;

	readonly target: Player;
	readonly save: SaveType;

	result: MonsterSaveAttackResult | undefined = undefined;

	readonly successMessage: string;
	readonly failureMessage: string;

	private completionHandler: ((attack: MonsterSaveAttack) => void) | undefined;

	constructor(
		target: Player,
		save: SaveType,
		successMessage: string,
		failureMessage: string,
		completionHandler?: ((attack: MonsterSaveAttack) => void) | undefined
	) {
		this.target = target;
		this.save = save;
		this.successMessage = successMessage;
		this.failureMessage = failureMessage;
		this.completionHandler = completionHandler;
	}

	complete() {
		this.completionHandler?.(this);
	}
}
