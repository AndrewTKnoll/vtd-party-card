import React, { Component, ReactNode, ChangeEvent } from "react";

import { ContextData, injectContext } from "components/globalContext";
import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";
import { ModalComponent } from  "components/structure/modalComponent";

interface SettingsComponentState {
	archiveString: string;
}

export const SettingsComponent = injectContext(class extends Component<ContextData, SettingsComponentState> {

	constructor(props: ContextData) {
		super(props);

		this.state = {
			archiveString: ""
		};
	}

	private settingUpdated(setting: "roomActionAutomaticDiceRoller" | "checkInitiativeBonus", newValue: boolean) {
		this.props.settings[setting] = newValue;
		this.props.onChange();
	}

	private downloadLogFile() {
		this.props.data.log.exportLog();
	}

	private copyDataToClipboard() {
		navigator.clipboard.writeText(this.props.data.generateArchive());
	}

	private setArchiveString(event: ChangeEvent<HTMLTextAreaElement>) {
		this.setState({
			archiveString: event.target.value
		});
	}

	private importPartyData() {
		try {
			const archive = JSON.parse(this.state.archiveString);

			if (!confirm("Confirm Import")) {
				return;
			}

			this.props.data.restoreFromArchive(archive);
			this.props.onChange();
		}
		catch (error) {
			alert("Invalid Data");
		}
	}

	override render(): ReactNode {
		return <>
			{this.props.data.diceRoller.authToken ? this.props.data.dungeon.dataVersion : undefined}
			<ModalComponent title="Settings"
				titleHeaderLevel="h2"
				openButtonText="Settings"
				contentClass="settings-component row">

				<div className="settings-component__half-col col">
					<div className="info-box">
						<h3>Dice Roller Behavior</h3>
						<p>Controls if room actions automatically trigger dice roller state changes or not.</p>
						<ItemListSelectComponent items={[true, false]}
							labelForItem={diceRollerBehaviorLabel}
							selectedItem={this.props.settings.roomActionAutomaticDiceRoller}
							onChange={this.settingUpdated.bind(this, "roomActionAutomaticDiceRoller")}/>
					</div>
				</div>
				<div className="settings-component__half-col col">
					<div className="info-box">
						<h3>Check Initiative Bonus</h3>
						<p>Controls if the bonus on initiative rolls is double-checked against the set value.</p>
						<ItemListSelectComponent items={[true, false]}
							labelForItem={checkInitiativeBonusLabel}
							selectedItem={this.props.settings.checkInitiativeBonus}
							onChange={this.settingUpdated.bind(this, "checkInitiativeBonus")}/>
					</div>
				</div>
				<div className="settings-component__half-col col">
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
				<div className="col">
					<div className="info-box">
						<h3>Party Data Export</h3>
						<p>
							Export the party card's current state. The text can then be pasted into the box below to import.
						</p>
						<div className="settings-component__button-list">
							<button type="button"
								onClick={this.copyDataToClipboard.bind(this)}>

								Copy Party Data to Clipboard
							</button>
							<button type="button"
								onClick={this.importPartyData.bind(this)}>

								Read Party Data from Input Box
							</button>
						</div>
						<textarea value={this.state.archiveString}
							onChange={this.setArchiveString.bind(this)}/>
					</div>
				</div>
			</ModalComponent>
		</>;
	}
});

function diceRollerBehaviorLabel(isAutomatic: boolean): string {
	return isAutomatic ? "Automatic" : "Manual";
}

function checkInitiativeBonusLabel(isChecked: boolean): string {
	return isChecked ? "Check the Bonus" : "Trust the Roll";
}
