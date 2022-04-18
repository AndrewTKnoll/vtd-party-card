import { SaveType } from "model/attributes/saveType";
import { Player } from "model/partyCard/player";
import { MonsterAttackType } from "model/roomAction/roomActionResult";

export enum MonsterSaveAttackResult {
	success = "success",
	failure = "failure"
}

export const allMonsterSaveAttackResults : MonsterSaveAttackResult[] = [
	MonsterSaveAttackResult.success,
	MonsterSaveAttackResult.failure
];

export function nameForMonsterSaveAttackResult(result: MonsterSaveAttackResult) {
	return result.charAt(0).toUpperCase() + result.slice(1);
}

interface MonsterSaveAttackParams {
	target: Player;
	save: SaveType;
	dc?: number | undefined;
	successMessage: string;
	failureMessage: string;
	immuneMessage?: string | undefined;
	completionHandler?: ((attack: MonsterSaveAttack) => void) | undefined;
}

export class MonsterSaveAttack {
	readonly type = MonsterAttackType.save;

	readonly target: Player;
	readonly save: SaveType;

	readonly dc: number | undefined;

	result: MonsterSaveAttackResult | undefined = undefined;

	readonly successMessage: string;
	readonly failureMessage: string;
	readonly immuneMessage: string | undefined;

	private completionHandler: ((attack: MonsterSaveAttack) => void) | undefined;

	constructor(params: MonsterSaveAttackParams) {
		this.target = params.target;
		this.save = params.save;
		this.dc = params.dc;
		this.successMessage = params.successMessage;
		this.failureMessage = params.failureMessage;
		this.immuneMessage = params.immuneMessage;
		this.completionHandler = params.completionHandler;
	}

	complete() {
		this.completionHandler?.(this);
	}
}
