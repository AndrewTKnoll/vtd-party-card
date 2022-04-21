/**** style import ****/
import "./main.scss";

/**** js imports ****/
import "utilities/arrayUtils";

import React from "react";
import ReactDOM from "react-dom";

import { VTDPartyCardComponent } from "components/vtdPartyCardComponent";

import { DataManager } from "model/dataManager";

/**** initialize editor ****/

const data = new DataManager();

const versionLabel = document.querySelector(".dungeon-version-label");
if (versionLabel) {
	versionLabel.textContent = data.dungeon.dataVersion;
}

const wrapper = document.querySelector(".vtd-party-card");
ReactDOM.render(<VTDPartyCardComponent data={data}/>, wrapper);
