/**** style import ****/
import "./main.scss";

/**** js imports ****/
import React from "react";
import ReactDOM from "react-dom";

import { VDMAssistantComponent } from "components/vdmAssistantComponent";

/**** initialize editor ****/

const wrapper = document.querySelector(".vdm-assistant");
ReactDOM.render(<VDMAssistantComponent/>, wrapper);
