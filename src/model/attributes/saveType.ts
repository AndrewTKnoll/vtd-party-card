export enum SaveType {
	fortitude = "fortitude",
	reflex = "reflex",
	will = "will"
}

export const allSaveTypes: SaveType[] = [
	SaveType.fortitude,
	SaveType.reflex,
	SaveType.will
];

export function shortNameForSaveType(save: SaveType): string {
	switch (save) {
		case SaveType.fortitude:
			return "Fort";
		case SaveType.reflex:
			return "Ref";
		case SaveType.will:
			return "Will";
	}
}
