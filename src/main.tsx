/**** style import ****/
import "./main.scss";

/**** js imports ****/
import "utilities/arrayUtils";

import React from "react";
import { createRoot } from "react-dom/client";

import { VTDPartyCardComponent } from "components/vtdPartyCardComponent";

import { DataManager } from "model/dataManager";

/**** initialize editor ****/

const data = new DataManager();

const versionLabel = document.querySelector(".dungeon-version-label");
if (versionLabel) {
	versionLabel.textContent = data.dungeon.dataVersion;
}

const root = createRoot(document.querySelector(".vtd-party-card")!);
root.render(<VTDPartyCardComponent data={data}/>);
