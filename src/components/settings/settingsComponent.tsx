import React, { Component, ReactNode } from "react";

import { ModalComponent } from  "components/structure/modalComponent";

import { DataManager } from "model/dataManager";

interface SettingsComponentProps {
	data: DataManager;
}
interface SettingsComponentState {}

export class SettingsComponent extends Component<SettingsComponentProps, SettingsComponentState> {

	private downloadLogFile() {
		this.props.data.log.exportLog();
	}

	override render(): ReactNode {
		return <>
			{this.props.data.diceRoller.authToken ? this.props.data.dungeon.dataVersion : undefined}
			<ModalComponent title="Settings"
				titleHeaderLevel="h2"
				openButtonText="Settings"
				contentClass="settings-component row">

				<div className="col">
					<div className="info-box">
						<h3>Log File</h3>
						<p>If something weird happens with the dice roller, this file could help figure it out.</p>
						<button type="button"
							className="setup__log-download-button"
							onClick={this.downloadLogFile.bind(this)}>

							Download Log File
						</button>
					</div>
				</div>
			</ModalComponent>
		</>;
	}
}
