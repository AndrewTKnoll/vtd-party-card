import { ResetLevel } from "model/attributes/resetLevel";
import { Class, nakedACForClass } from "model/partyCard/class";

import { DefaultMap } from "utilities/defaultMap";
import { JSONValue, validate, isObject } from "utilities/jsonUtils";

export enum WeaponType {
	melee = "melee",
	ranged = "ranged"
}

const allWeaponTypes = [
	WeaponType.melee,
	WeaponType.ranged
];

export enum ACType {
	melee = "melee",
	ranged = "ranged",
	naked = "naked"
}

export class Player {
	readonly class: Class;

	isPresent: boolean = true;
	isDead: boolean = false;
	get isActive(): boolean {
		return this.isPresent && !this.isDead;
	}
	isGuarded: boolean = false;

	currentWeapon: WeaponType = WeaponType.melee;

	meleeAC: number = 0;
	meleeWeapon: string = "";
	meleeDamageBonus: number = 0;
	meleeDamageTypes: DefaultMap<string, number> = new DefaultMap(0);

	rangedAC: number = 0;
	rangedWeapon: string = "";
	rangedDamageBonus: number = 0;
	rangedDamageTypes: DefaultMap<string, number> = new DefaultMap(0);

	retributionDamageTotal: number = 0;
	retributionDamageTypes: DefaultMap<string, number> = new DefaultMap(0);

	get nakedAC(): number {
		return nakedACForClass(this.class);
	}

	acAdjust: number = 0;

	effectiveAC(type: ACType): number {
		switch (type) {
			case ACType.melee:
				return this.meleeAC + this.acAdjust;
			case ACType.ranged:
				return this.rangedAC + this.acAdjust;
			case ACType.naked:
				return this.nakedAC + this.acAdjust;
		}
	}

	hasFreeMovement: boolean = false;
	hasQuickStrike: boolean = false;

	flags: DefaultMap<string, boolean> = new DefaultMap(false);
	countFlags: DefaultMap<string, number> = new DefaultMap(0);

	constructor(classId: Class) {
		this.class = classId;
	}

	restoreFromArchive(archive: JSONValue | undefined) {
		if (!isObject(archive)) {
			return;
		}

		this.isPresent = validate(archive["isPresent"], this.isPresent);
		this.isDead = validate(archive["isDead"], this.isDead);
		this.isGuarded = validate(archive["isGuarded"], this.isGuarded);

		this.currentWeapon = validate(archive["currentWeapon"], this.currentWeapon, allWeaponTypes);

		this.meleeAC = validate(archive["meleeAC"], this.meleeAC);
		this.meleeWeapon = validate(archive["meleeWeapon"], this.meleeWeapon);
		this.meleeDamageBonus = validate(archive["meleeDamageBonus"], this.meleeDamageBonus);
		this.meleeDamageTypes.restoreFromArchive(archive["meleeDamageTypes"]);

		this.rangedAC = validate(archive["rangedAC"], this.rangedAC);
		this.rangedWeapon = validate(archive["rangedWeapon"], this.rangedWeapon);
		this.rangedDamageBonus = validate(archive["rangedDamageBonus"], this.rangedDamageBonus);
		this.rangedDamageTypes.restoreFromArchive(archive["rangedDamageTypes"]);

		this.retributionDamageTotal = validate(archive["retributionDamageTotal"], this.retributionDamageTotal);
		this.retributionDamageTypes.restoreFromArchive(archive["retributionDamageTypes"]);

		this.acAdjust = validate(archive["acAdjust"], this.acAdjust);

		this.hasFreeMovement = validate(archive["hasFreeMovement"], this.hasFreeMovement);
		this.hasQuickStrike = validate(archive["hasQuickStrike"], this.hasQuickStrike);

		this.flags.restoreFromArchive(archive["flags"]);
		this.countFlags.restoreFromArchive(archive["countFlags"]);
	}

	reset(level: ResetLevel) {
		if (level === ResetLevel.round) {
			return;
		}

		this.acAdjust = 0;

		if (level === ResetLevel.room) {
			return;
		}

		this.isPresent = true;
		this.isDead = false;
		this.isGuarded = false;

		this.currentWeapon = WeaponType.melee;

		this.meleeAC = 0;
		this.meleeWeapon = "";
		this.meleeDamageBonus = 0;
		this.meleeDamageTypes = new DefaultMap(0);

		this.rangedAC = 0;
		this.rangedWeapon = "";
		this.rangedDamageBonus = 0;
		this.rangedDamageTypes = new DefaultMap(0);

		this.retributionDamageTotal = 0;
		this.retributionDamageTypes = new DefaultMap(0);

		this.hasFreeMovement = false;
		this.hasQuickStrike = false;

		this.flags = new DefaultMap(false);
		this.countFlags = new DefaultMap(0);
	}

	canGuard(otherPlayer: Player): boolean {
		return (this.class === Class.paladin) && (otherPlayer !== this) && this.isActive && otherPlayer.isGuarded;
	}
}
