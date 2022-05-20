import { Monster } from "model/dungeon/monster";
import { Class } from "model/partyCard/class";
import { PartyCard } from "model/partyCard/partyCard";
import { Player } from "model/partyCard/player";

export function checkTaunt<T>(monster: Monster, party: PartyCard, generator: (dwarf: Player[]) => T): T {
	const dwarf = party.player(Class.dwarf);
	const guarded = dwarf.isGuarded;

	if (monster.isTaunted) {
		dwarf.isGuarded = false;
	}

	const result = generator((monster.isTaunted && dwarf.isActive) ? [dwarf] : []);

	dwarf.isGuarded = guarded;

	return result;
}
