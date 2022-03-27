import { Player, WeaponType } from "model/partyCard/player";
import { MonsterAttackType } from "model/roomAction/roomActionResult";

interface AutoHit {
	auto: true;
}
interface RollHit {
	auto: false;
	roll: number;
	total: number;
}
type HitType = AutoHit | RollHit;

interface MonsterWeaponAttackParams {
	target: Player;
	paladin?: Player | undefined;
	weaponOverride?: WeaponType | "naked" | undefined;
	hitBonus?: number | undefined;
	autoHitThreshold?: number | undefined;
	damageAmount: number;
	damageType: string;
	note?: string | ((attack: MonsterWeaponAttack) => string) | undefined;
	completionHandler?: ((attack: MonsterWeaponAttack) => void) | undefined;
}

export class MonsterWeaponAttack {
	readonly type = MonsterAttackType.weapon;

	readonly target: Player;
	readonly paladin: Player | undefined;

	private weaponOverride: WeaponType | "naked" | undefined;
	get effectiveWeapon(): WeaponType | "naked" {
		return this.weaponOverride || (this.paladin || this.target).currentWeapon;
	}

	readonly autoHitThreshold: number;
	readonly hit: HitType;

	get effectiveAC(): number {
		const target = this.paladin || this.target;
		switch (this.effectiveWeapon) {
			case WeaponType.melee:
				return target.meleeAC + target.acAdjust;
			case WeaponType.ranged:
				return target.rangedAC + target.acAdjust;
			case "naked":
				return target.nakedAC + target.acAdjust;
		}
	}

	get isHit(): boolean {
		if (this.hit.auto) {
			return true;
		}
		if (this.hit.roll >= this.autoHitThreshold) {
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

		this.autoHitThreshold = params.autoHitThreshold || 20;

		this.target = params.target;
		this.paladin = (params.paladin?.canGuard(params.target) ? params.paladin : undefined);
		this.weaponOverride = params.weaponOverride;
		this.damageAmount = params.damageAmount;
		this.damageType = params.damageType;

		this.note = (typeof(params.note) === "function") ? params.note(this) : (params.note || "");

		this.completionHandler = params.completionHandler;
	}

	complete() {
		this.completionHandler?.(this);
	}
}
