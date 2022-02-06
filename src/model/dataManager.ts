import { ResetLevel } from "model/attributes/resetLevel";
import { Dungeon } from "model/dungeon/dungeon";
import { PartyCard } from "model/partyCard/partyCard";

const dungeonStorageKey = "dungeon";
const partyCardStorageKey = "partyCard";

export class DataManager {
	readonly dungeon = new Dungeon();
	readonly partyCard = new PartyCard();

	constructor() {
		try {
			const archive = localStorage.getItem(dungeonStorageKey);
			if (archive) {
				this.dungeon.restoreFromArchive(JSON.parse(archive));
			}
		}
		catch (error) {
			this.dungeon = new Dungeon();
		}

		try {
			const archive = localStorage.getItem(partyCardStorageKey);
			if (archive) {
				this.partyCard.restoreFromArchive(JSON.parse(archive));
			}
		}
		catch (error) {
			this.partyCard = new PartyCard();
		}
	}

	save() {
		localStorage.setItem(dungeonStorageKey, JSON.stringify(this.dungeon));
		localStorage.setItem(partyCardStorageKey, JSON.stringify(this.partyCard));
	}

	reset(level: ResetLevel) {
		this.dungeon.reset(level, this.partyCard);
		this.partyCard.reset(level);
	}
}
