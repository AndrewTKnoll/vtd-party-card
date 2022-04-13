import { SaveType } from "model/attributes/saveType";
import { RollChangeData, RollChangeDataRoll } from "model/diceRoller/socket/socketResponseMessage";
import { Class } from "model/partyCard/class";

export type Roll = InitiativeRoll | AttackRoll | SaveRoll;

export interface InitiativeRoll {
	type: "initiative";
	class: Class;
	dieResult: number;
	modifiedResult: number;
	effect: string | undefined;
}

export interface AttackRoll {
	type: "attack";
	class: Class;
	dieResult: number;
	modifiedResult: number;
	effect: string | undefined;
	attackType: `${"melee" | "ranged"}_${"main" | "off"}` | "spell";
	success: boolean;
	damage: number;
}

export interface SaveRoll {
	type: "save";
	class: Class;
	dieResult: number;
	modifiedResult: number;
	effect: string | undefined;
	saveType: SaveType;
	success: boolean;
}


export function rollFromUpdate(rollChange: RollChangeData, roll: RollChangeDataRoll, rollIndex: number): Roll | undefined {
	const rollClass = classFromId(rollChange.classId);
	if (!rollClass) {
		return undefined;
	}

	switch (rollChange.eventType) {
		case "initiative_roll":
			return {
				type: "initiative",
				class: rollClass,
				dieResult: roll.dieResult,
				modifiedResult: roll.modifiedResult,
				effect: roll.effect
			};
		case "attack_roll":
			if (roll.type === "range_main") {
				roll.type = (roll.effect === "(null)") ? "spell" : "ranged_main";
			}
			if (rollIndex === 1) {
				if (roll.type === "melee_main") {
					roll.type = "melee_off";
				}
				if (roll.type === "ranged_main") {
					roll.type = "ranged_off";
				}
			}

			if (
				roll.type === "melee_main" ||
				roll.type === "melee_off" ||
				roll.type === "ranged_main" ||
				roll.type === "ranged_off" ||
				roll.type === "spell"
			) {
				return {
					type: "attack",
					class: rollClass,
					dieResult: roll.dieResult,
					modifiedResult: roll.modifiedResult,
					effect: roll.effect,
					attackType: roll.type,
					success: roll.isSuccess || false,
					damage: roll.damage || 0
				}
			}
			return undefined;
		case "save_roll":
			const save = saveTypeFromId(roll.type);
			if (!save) {
				return undefined;
			}
			return {
				type: "save",
				class: rollClass,
				dieResult: roll.dieResult,
				modifiedResult: roll.modifiedResult,
				effect: roll.effect,
				saveType: save,
				success: roll.isSuccess || false
			}
	}
	return undefined;
}

function classFromId(classId: string): Class | undefined {
	switch (classId) {
		case "barbarian":
			return Class.barbarian;
		case "bard":
			return Class.bard;
		case "cleric":
			return Class.cleric;
		case "druid":
			return Class.druid;
		case "dwarf":
			return Class.dwarf;
		case "elf":
			return Class.elf;
		case "fighter":
			return Class.fighter;
		case "monk":
			return Class.monk;
		case "paladin":
			return Class.paladin;
		case "ranger":
			return Class.ranger;
		case "rogue":
			return Class.rogue;
		case "wizard":
			return Class.wizard;
	}
	return undefined;
}

function saveTypeFromId(saveId: string | undefined): SaveType | undefined {
	switch (saveId) {
		case "fortitude":
			return SaveType.fortitude;
		case "reflex":
			return SaveType.reflex;
		case "will":
			return SaveType.will;
	}
	return undefined;
}
