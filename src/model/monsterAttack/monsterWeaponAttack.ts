import { Monster } from "model/dungeon/monster";
import { Player, WeaponType, ACType } from "model/partyCard/player";
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
	acOverride?: ACType | undefined;
	retributionTarget?: Monster | undefined;
	hitBonus?: number | undefined;
	autoHitThreshold?: number | undefined;
	damageAmount: number;
	damageType: string;
	note?: string | ((attack: MonsterWeaponAttack) => string) | undefined;
	completionHandler?: ((attack: MonsterWeaponAttack) => void) | undefined;
}

export class MonsterWeaponAttack {
	readonly type = MonsterAttackType.weapon;

	private readonly retributionTarget: Monster | undefined;
	get triggersRetributionDamage(): boolean {
		return this.isHit && (this.retributionTarget !== undefined) && (this.effectiveTarget.retributionDamageTotal > 0);
	}

	readonly target: Player;
	readonly paladin: Player | undefined;
	get effectiveTarget(): Player {
		return this.paladin || this.target;
	}

	private acOverride: ACType | undefined;
	get effectiveACType(): ACType {
		if (this.acOverride) {
			return this.acOverride;
		}
		return (this.effectiveTarget.currentWeapon === WeaponType.ranged ? ACType.ranged : ACType.melee);
	}

	readonly autoHitThreshold: number;
	readonly hit: HitType;

	get effectiveAC(): number {
		return this.effectiveTarget.effectiveAC(this.effectiveACType);
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

		return this.hit.total >= this.effectiveTarget.effectiveAC(this.effectiveACType);
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
		this.retributionTarget = params.retributionTarget;
		this.paladin = (params.paladin?.canGuard(params.target) ? params.paladin : undefined);
		this.acOverride = params.acOverride;
		this.damageAmount = params.damageAmount;
		this.damageType = params.damageType;

		this.note = (typeof(params.note) === "function") ? params.note(this) : (params.note || "");

		this.completionHandler = params.completionHandler;
	}

	complete() {
		if (this.triggersRetributionDamage) {
			this.retributionTarget?.takeDamage({
				type: "retribution",
				player: this.effectiveTarget,
				amount: this.effectiveTarget.retributionDamageTotal
			});
		}
		this.completionHandler?.(this);
	}
}
