import { SaveType } from "model/attributes/saveType";

export type RollType = InitiativeRollType | AttackRollType | SaveRollType;

export interface InitiativeRollType {
	type: "initiative";
}

export interface AttackRollType {
	type: "attack";
}

export interface SaveRollType {
	type: "save";
	save: SaveType;
}
