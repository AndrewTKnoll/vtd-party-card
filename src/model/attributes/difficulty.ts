export enum Difficulty {
	normal = 0,
	hardcore = 1,
	nightmare = 2,
	epic = 3
}

export const allDifficulties: Difficulty[] = [
	Difficulty.normal,
	Difficulty.hardcore,
	Difficulty.nightmare,
	Difficulty.epic
];

export function nameForDifficulty(difficulty: Difficulty): string {
	switch (difficulty) {
		case Difficulty.normal:
			return "Normal";
		case Difficulty.hardcore:
			return "Hardcore";
		case Difficulty.nightmare:
			return "Nightmare";
		case Difficulty.epic:
			return "Epic";
	}
}
