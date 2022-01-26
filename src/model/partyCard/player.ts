import { DefaultMap } from "utilities/defaultMap";
import { Class } from "model/partyCard/class";

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
	meleeDamageTypes: DefaultMap<number> = new DefaultMap(0);

	rangedAC: number = 0;
	rangedWeapon: string = "";
	rangedDamageTypes: DefaultMap<number> = new DefaultMap(0);

	acAdjust: number = 0;

	hasFreeMovement: boolean = false;

	flags: DefaultMap<boolean> = new DefaultMap(false);
	countFlags: DefaultMap<number> = new DefaultMap(0);

	constructor(classId: Class) {
		this.class = classId;
	}
}
