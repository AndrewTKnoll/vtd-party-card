import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";

export class Dungeon {
	difficulty: Difficulty = Difficulty.normal;

	restoreFromArchive(archive: any) {
		this.difficulty = archive.difficulty;
	}

	reset(level: ResetLevel) {
		if (level < ResetLevel.full) {
			return;
		}

		this.difficulty = Difficulty.normal;
	}
}
