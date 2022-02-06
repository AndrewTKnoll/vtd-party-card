/**** style import ****/
import "./main.scss";

/**** js imports ****/
import React from "react";
import ReactDOM from "react-dom";

import { VDMAssistantComponent } from "components/vdmAssistantComponent";

import { DataManager } from "model/dataManager";

/**** initialize editor ****/

const data = new DataManager();

const wrapper = document.querySelector(".vdm-assistant");
ReactDOM.render(<VDMAssistantComponent data={data}/>, wrapper);
