/**** style import ****/
import "./main.scss";

/**** js imports ****/
import "utilities/arrayUtils";
import "utilities/storageUtils";

import React from "react";
import { createRoot } from "react-dom/client";

import { VTDPartyCardComponent } from "components/vtdPartyCardComponent";

import { DataManager } from "model/dataManager";

/**** initialize editor ****/

const data = new DataManager();

const root = createRoot(document.querySelector(".vtd-party-card")!);
root.render(
	<VTDPartyCardComponent data={data}
		versionElement={document.querySelector(".dungeon-version-label")!}/>
);
