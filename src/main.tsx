/**** style import ****/
import "./main.scss";

/**** js imports ****/
import "utilities/arrayUtils";
import "utilities/storageUtils";

import React from "react";
import { createRoot } from "react-dom/client";

import { VTDPartyCardComponent } from "components/vtdPartyCardComponent";

import { DataManager } from "model/dataManager";
import { SettingsManager } from "model/settingsManager";

/**** initialize editor ****/

const data = new DataManager();
const settings = new SettingsManager();

const root = createRoot(document.querySelector(".vtd-party-card")!);
root.render(
	<VTDPartyCardComponent data={data}
		settings={settings}
		settingsContainer={document.querySelector(".vtd-header__settings")!}/>
);
