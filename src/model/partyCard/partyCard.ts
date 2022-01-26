import { Player } from "model/partyCard/player";
import { Class, allClasses } from "model/partyCard/class";

export class PartyCard {
	readonly players: Player[] = allClasses.map((classId: Class) => {
		return new Player(classId);
	});

	get presentPlayers(): Player[] {
		return this.players.filter((player: Player) => {
			return player.isPresent;
		});
	}

	get activePlayers(): Player[] {
		return this.players.filter((player: Player) => {
			return player.isActive;
		});
	}

	player(classId: Class): Player {
		return this.players.find((player: Player) => {
			return player.class === classId;
		})!;
	}

	dwarfTaunt: boolean = false;
	get tauntingDwarf(): Player | undefined {
		const dwarf = this.player(Class.dwarf);
		return (this.dwarfTaunt && dwarf.isPresent) ? dwarf : undefined;
	}
}
