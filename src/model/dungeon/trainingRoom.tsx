import React, { ReactNode } from "react";

import { SetupComponent } from "components/setup/setupComponent";

import { DataManager } from "model/dataManager";
import { Room } from "model/dungeon/room";

export class TrainingRoom extends Room {

	constructor(dataManager: DataManager) {
		super({
			dataManager: dataManager,
			name: "Training Room",
			id: "Training"
		});
	}

	/* data override points */

	override get idIsStandalone(): boolean {
		return true;
	}

	override get hasInfoColumn(): boolean {
		return false;
	}

	override mainSectionNotes(update: () => void): ReactNode {
		return <SetupComponent data={this.dataManager}
			onChange={update}/>;
	}
}
