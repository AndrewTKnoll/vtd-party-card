import React, { Component, ReactNode } from "react";

import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";
import { ModalComponent } from  "components/structure/modalComponent";

import { DataManager } from "model/dataManager";
import { SettingsManager } from "model/settingsManager";

interface SettingsComponentProps {
	data: DataManager;
	settings: SettingsManager;
}
interface SettingsComponentState {}

export class SettingsComponent extends Component<SettingsComponentProps, SettingsComponentState> {

	private diceRollerBehaviorChanged(newValue: boolean) {
		this.props.settings.roomActionAutomaticDiceRoller = newValue;
		this.forceUpdate();
	}

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
						<h3>Dice Roller Behavior</h3>
						<p>Controls if room actions automatically trigger dice roller state changes or not.</p>
						<ItemListSelectComponent items={[true, false]}
							labelForItem={diceRollerBehaviorLabel}
							selectedItem={this.props.settings.roomActionAutomaticDiceRoller}
							onChange={this.diceRollerBehaviorChanged.bind(this)}/>
					</div>
				</div>
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

function diceRollerBehaviorLabel(isAutomatic: boolean): string {
	return isAutomatic ? "Automatic" : "Manual";
}
