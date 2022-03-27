import { ReactNode } from "react";

import { Player } from "model/partyCard/player";
import { MonsterAttackType } from "model/roomAction/roomActionResult";

interface MonsterSpecialAttackParams {
	target: Player;
	description: (complete: () => void) => ReactNode;
	completionHandler?: ((attack: MonsterSpecialAttack) => void) | undefined;
}

export class MonsterSpecialAttack {
	readonly type = MonsterAttackType.special;

	readonly target: Player;
	readonly description: (complete: () => void) => ReactNode;

	private completionHandler: ((attack: MonsterSpecialAttack) => void) | undefined;

	constructor(params: MonsterSpecialAttackParams) {
		this.target = params.target;
		this.description = params.description;
		this.completionHandler = params.completionHandler;
	}

	complete() {
		this.completionHandler?.(this);
	}
}
