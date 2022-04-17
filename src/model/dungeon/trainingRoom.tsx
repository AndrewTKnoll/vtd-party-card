import React, { ReactNode } from "react";

import { SetupComponent } from "components/setup/setupComponent";

import { DataManager } from "model/dataManager";
import { Room } from "model/dungeon/room";

export class TrainingRoom extends Room {

	constructor(dataManager: DataManager) {
		super({
			dataManager: dataManager,
			name: "Training Room",
			id: "Training",
			idIsStandalone: true,
			hasInfoColumn: false
		});
	}

	/* data override points */

	override mainSectionNotes(update: () => void): ReactNode {
		return <SetupComponent data={this.dataManager}
			onChange={update}/>;
	}
}
