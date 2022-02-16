export enum Class {
	barbarian = "barbarian",
	bard = "bard",
	cleric = "cleric",
	druid = "druid",
	dwarf = "dwarf",
	elf = "elf",
	fighter = "fighter",
	monk = "monk",
	paladin = "paladin",
	ranger = "ranger",
	rogue = "rogue",
	wizard = "wizard"
}

export const allClasses: Class[] = [
	Class.barbarian,
	Class.bard,
	Class.cleric,
	Class.druid,
	Class.dwarf,
	Class.elf,
	Class.fighter,
	Class.monk,
	Class.paladin,
	Class.ranger,
	Class.rogue,
	Class.wizard
];

export function nameForClass(classValue: Class): string {
	switch (classValue) {
		case Class.dwarf:
			return "Dwarf Fighter";
		case Class.elf:
			return "Elf Wizard";
	}
	return classValue.charAt(0).toUpperCase() + classValue.slice(1);
}

export function nakedACForClass(classValue: Class): number {
	switch (classValue) {
		case Class.barbarian:
			return 11;
		case Class.bard:
			return 11;
		case Class.cleric:
			return 10;
		case Class.druid:
			return 12;
		case Class.dwarf:
			return 11;
		case Class.elf:
			return 11;
		case Class.fighter:
			return 11;
		case Class.monk:
			return 16;
		case Class.paladin:
			return 11;
		case Class.ranger:
			return 13;
		case Class.rogue:
			return 13;
		case Class.wizard:
			return 10;
	}
}
