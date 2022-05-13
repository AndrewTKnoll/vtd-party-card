import { ResetLevel } from "model/attributes/resetLevel";
import { Class, allClasses } from "model/partyCard/class";
import { Player } from "model/partyCard/player";

import { JSONValue, validate, isObject, isArray } from "utilities/jsonUtils";

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

	initiativeBonus = 0;

	restoreFromArchive(archive: JSONValue | undefined) {
		if (!isObject(archive)) {
			return;
		}

		this.initiativeBonus = validate(archive["initiativeBonus"], this.initiativeBonus);

		const playerArchive = archive["players"];
		if (!isArray(playerArchive)) {
			return;
		}

		this.players.forEach((player, index) => {
			player.restoreFromArchive(playerArchive[index]);
		});
	}

	reset(level: ResetLevel) {
		this.players.forEach((player) => {
			player.reset(level);
		});

		if (level !== ResetLevel.full) {
			return;
		}

		this.initiativeBonus = 0;
	}
}
