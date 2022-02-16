import { DefaultMap } from "utilities/defaultMap";

import { ResetLevel } from "model/attributes/resetLevel";
import { Class, nakedACForClass } from "model/partyCard/class";

export enum WeaponType {
	melee = "melee",
	ranged = "ranged"
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
	meleeDamageTypes: DefaultMap<string, number> = new DefaultMap(0);

	rangedAC: number = 0;
	rangedWeapon: string = "";
	rangedDamageTypes: DefaultMap<string, number> = new DefaultMap(0);

	get nakedAC(): number {
		return nakedACForClass(this.class);
	}

	acAdjust: number = 0;

	hasFreeMovement: boolean = false;

	flags: DefaultMap<string, boolean> = new DefaultMap(false);
	countFlags: DefaultMap<string, number> = new DefaultMap(0);

	constructor(classId: Class) {
		this.class = classId;
	}

	restoreFromArchive(archive: any) {
		this.isPresent = archive.isPresent;
		this.isDead = archive.isDead;
		this.isGuarded = archive.isGuarded;

		this.currentWeapon = archive.currentWeapon;

		this.meleeAC = archive.meleeAC;
		this.meleeWeapon = archive.meleeWeapon;
		this.meleeDamageTypes = new DefaultMap(0, archive.meleeDamageTypes.values);

		this.rangedAC = archive.rangedAC;
		this.rangedWeapon = archive.rangedWeapon;
		this.rangedDamageTypes = new DefaultMap(0, archive.rangedDamageTypes.values);

		this.acAdjust = archive.acAdjust;

		this.hasFreeMovement = archive.hasFreeMovement;

		this.flags = new DefaultMap(false, archive.flags.values);
		this.countFlags = new DefaultMap(0, archive.countFlags.values);
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
		this.meleeDamageTypes = new DefaultMap(0);

		this.rangedAC = 0;
		this.rangedWeapon = "";
		this.rangedDamageTypes = new DefaultMap(0);

		this.hasFreeMovement = false;

		this.flags = new DefaultMap(false);
		this.countFlags = new DefaultMap(0);
	}

	canGuard(otherPlayer: Player): boolean {
		return (this.class === Class.paladin) && (otherPlayer !== this) && this.isActive && otherPlayer.isGuarded;
	}
}
