/**** style import ****/
import "./main.scss";

/**** js imports ****/
import "utilities/arrayUtils";
import "utilities/storageUtils";

import React from "react";
import { createRoot } from "react-dom/client";

import { VTDPartyCardComponent } from "components/vtdPartyCardComponent";
import { GlobalContext } from "components/globalContext";

import { DataManager } from "model/dataManager";
import { SettingsManager } from "model/settingsManager";

/**** initialize editor ****/

const root = createRoot(document.querySelector(".vtd-party-card")!);
const settingsContainer = document.querySelector(".vtd-header__settings")!;

const context = {
	data: new DataManager(),
	settings: new SettingsManager(),
	onChange: render
};

function render() {
	root.render(
		<GlobalContext.Provider value={context}>
			<VTDPartyCardComponent settingsContainer={settingsContainer}/>
		</GlobalContext.Provider>
	);
}
render();
