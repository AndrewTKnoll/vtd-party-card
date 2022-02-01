export type PlayerAttackCritMultiplier = 1 | 2 | 3;

export const allPlayerAttackCritMultipliers: PlayerAttackCritMultiplier[] = [1, 2, 3];

export function nameForPlayerAttackCritMultiplier(multiplier: PlayerAttackCritMultiplier): string {
	return `x${multiplier}`;
}
