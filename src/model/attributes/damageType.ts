export enum DamageType {
	cold = "cold",
	fire = "fire",
	shock = "shock",
	sonic = "sonic",
	force = "force",
	poison = "poison",
	sacred = "sacred",
	darkrift = "darkrift",
	eldritch = "eldritch",
	acid = "acid"
}

export const allDamageTypes: DamageType[] = [
	DamageType.cold,
	DamageType.fire,
	DamageType.shock,
	DamageType.sonic,
	DamageType.force,
	DamageType.poison,
	DamageType.sacred,
	DamageType.darkrift,
	DamageType.eldritch,
	DamageType.acid
];

export function nameForDamageType(damageType: DamageType): string {
	return damageType.charAt(0).toUpperCase() + damageType.slice(1);
}
