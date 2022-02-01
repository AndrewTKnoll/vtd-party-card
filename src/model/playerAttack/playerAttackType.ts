export enum PlayerAttackType {
	melee = "melee",
	ranged = "ranged",
	spell = "spell"
}

export const allPlayerAttackTypes: PlayerAttackType[] = [
	PlayerAttackType.melee,
	PlayerAttackType.ranged,
	PlayerAttackType.spell
];

export function nameForPlayerAttackType(attackType: PlayerAttackType): string {
	return attackType.charAt(0).toUpperCase() + attackType.slice(1);
}
