import { PartyCard } from "model/partyCard/partyCard";
import { RoomAction } from "model/roomAction/roomAction";
import { MonsterAttack } from "model/roomAction/monsterAttack";

export class RoomActionResult {
	readonly action: RoomAction;
	private party: PartyCard;

	readonly attacks: MonsterAttack[];

	constructor(action: RoomAction, party: PartyCard, attacks: MonsterAttack[]) {
		this.action = action;
		this.party = party;

		this.attacks = attacks;
	}

	complete() {
		this.action.beforeCompletion?.(this.party);
		this.attacks.forEach((attack) => {
			attack.complete();
		});
		this.action.afterCompletion?.(this.party);
	}
}
