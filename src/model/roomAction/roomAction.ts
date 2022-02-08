import { allClasses } from "model/partyCard/class";
import { PartyCard } from "model/partyCard/partyCard";
import { MonsterAttack } from "model/roomAction/monsterAttack";
import { RoomActionResult } from "model/roomAction/roomActionResult";

type AttackGenerator = (party: PartyCard) => MonsterAttack[];
type CompletionEventHandler = (party: PartyCard) => void;

export class RoomAction {
	readonly name: string;

	private attackGenerator: AttackGenerator;

	readonly beforeCompletion: CompletionEventHandler | undefined;
	readonly afterCompletion: CompletionEventHandler | undefined;

	constructor(
		name: string,
		attackGenerator: AttackGenerator,
		beforeCompletion?: CompletionEventHandler | undefined,
		afterCompletion?: CompletionEventHandler | undefined
	) {
		this.name = name;
		this.attackGenerator = attackGenerator;

		this.beforeCompletion = beforeCompletion;
		this.afterCompletion = afterCompletion;
	}

	perform(party: PartyCard): RoomActionResult | undefined {
		if (party.activePlayers.length === 0) {
			return undefined;
		}
		const attacks = this.attackGenerator(party);
		attacks.sort((first, second) => {
			const firstIndex = allClasses.indexOf(first.target.class);
			const secondIndex = allClasses.indexOf(second.target.class);

			return firstIndex - secondIndex;
		});

		return new RoomActionResult(this, party, attacks);
	}
}
