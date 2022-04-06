import React, { Component, ReactNode, ChangeEvent } from "react";

import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";
import { ValidatedTextInput } from "components/controls/validatedTextInput";
import { CollapseComponent } from "components/structure/collapseComponent";
import { TimerComponent } from "components/widgets/timerComponent";

import { Difficulty, allDifficulties, nameForDifficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { roomTimeDuration } from "model/dungeon/room";
import { DataManager } from "model/dataManager";

interface SetupComponentProps {
	data: DataManager;
	onChange: () => void;
}
interface SetupComponentState {}

export class SetupComponent extends Component<SetupComponentProps, SetupComponentState> {

	private setDifficulty(newDifficulty: Difficulty) {
		this.props.data.difficulty = newDifficulty;
		this.props.onChange();
	}

	private startTimeChanged(event: ChangeEvent<HTMLInputElement>) {
		this.props.data.localOffsetStartTime = new Date(event.target.value);
		this.props.onChange();
	}

	private fullReset() {
		if (confirm("Confirm Reset")) {
			this.props.data.reset(ResetLevel.full);
			this.props.onChange();
		}
	}

	private prepareForParty() {
		this.props.data.prepareForParty();
		this.props.onChange();
	}

	private copyPasswordToClipboard() {
		navigator.clipboard.writeText(this.props.data.dungeon.eventPasswords[this.props.data.difficulty]);
	}

	private copySkillTestsToClipboard() {
		navigator.clipboard.writeText(this.props.data.skillTestLinks.join("\n"));
	}

	private copySlotIDToClipboard() {
		if (this.props.data.diceRoller.slotId) {
			navigator.clipboard.writeText(this.props.data.diceRoller.slotId.toUpperCase());
		}
	}

	private downloadLogFile() {
		this.props.data.log.exportLog();
	}

	private updateSlotId(newValue: string) {
		this.props.data.diceRoller.slotId = newValue.toLowerCase();
		this.props.onChange();
	}

	override render(): ReactNode {
		let dateString = "";
		let room1StartTime;
		let introVideoStartTime;
		let recapVideoStartTime;

		if (this.props.data.startTime) {
			dateString = this.props.data.utcOffsetStartTime!.toISOString().substring(0, 16);
			room1StartTime = new Date(this.props.data.startTime.getTime() + roomTimeDuration * 3);
		}

		if (room1StartTime) {
			introVideoStartTime = new Date(room1StartTime.getTime() - this.props.data.dungeon.introVideoLength);

			if (this.props.data.dungeon.recapVideoLength) {
				recapVideoStartTime = new Date(introVideoStartTime.getTime() - this.props.data.dungeon.recapVideoLength);
			}
		}

		return (
			<CollapseComponent headerText="Setup"
				headerLevel="h2"
				contentClass="setup row">

				<div className="setup__main-col col">
					<div className="row">
						<div className="setup__settings-col col">
							<section className="setup__box">
								<h3>Settings</h3>
								<div className="setup__settings-row">
									<button type="button"
										onClick={this.fullReset.bind(this)}>

										Full Reset
									</button>
									<label>
										Difficulty:

										<ItemListSelectComponent isOptional={false}
											items={allDifficulties}
											labelForItem={nameForDifficulty}
											selectedItem={this.props.data.difficulty}
											onChange={this.setDifficulty.bind(this)}/>
									</label>
								</div>
								<div className="setup__settings-row">
									<button type="button"
										onClick={this.prepareForParty.bind(this)}>

										Prepare Dungeon for Party
									</button>
								</div>
								<div className="setup__settings-row">
									<span>
										{`Event Password: ${this.props.data.dungeon.eventPasswords[this.props.data.difficulty]}`}
									</span>
									<button type="button"
										onClick={this.copyPasswordToClipboard.bind(this)}>

										Copy to Clipboard
									</button>
								</div>
								<div className="setup__settings-row">
									<span>
										Skill Test Links
									</span>
									<button type="button"
										onClick={this.copySkillTestsToClipboard.bind(this)}>

										Copy to Clipboard
									</button>
								</div>
							</section>
							<CollapseComponent headerText="Log File"
								headerLevel="h3"
								contentClass="setup__box">

								<p>If something weird happens with the dice roller, this file could help figure it out.</p>
								<div className="setup__settings-row">
									<button type="button"
										className="setup__log-download-button"
										onClick={this.downloadLogFile.bind(this)}>

										Download Log File
									</button>
								</div>
							</CollapseComponent>
						</div>
						<div className="setup__time-col col">
							<section className="setup__box">
								<h3>Run-Specific Settings</h3>
								<h4>Dice Roller Slot ID:</h4>
								<ValidatedTextInput value={this.props.data.diceRoller.slotId?.toUpperCase() || ""}
									validation={/^[a-z,A-Z]{6}$/}
									onChange={this.updateSlotId.bind(this)}/>
								{this.props.data.diceRoller.slotId !== undefined &&
									<button type="button"
										onClick={this.copySlotIDToClipboard.bind(this)}>

										Copy to Clipboard
									</button>
								}
								<h4>Ticket Start Time:</h4>
								<input type="datetime-local"
									value={dateString}
									onChange={this.startTimeChanged.bind(this)}/>
								{recapVideoStartTime !== undefined &&
									<TimerComponent targetDate={recapVideoStartTime}
										prefixText="Time until recap video:"
										afterTimeText={"after start"}/>
								}
								{introVideoStartTime !== undefined &&
									<TimerComponent targetDate={introVideoStartTime}
										prefixText="Time until intro video:"
										afterTimeText={"after start"}/>
								}
								{room1StartTime !== undefined &&
									<TimerComponent targetDate={room1StartTime}
										prefixText="Time until room one:"
										afterTimeText={"after start"}/>
								}
							</section>
						</div>
					</div>
				</div>
				<div className="setup__checklist-col col">
					<section className="setup__box">
						<h3>Pre-Event Checklist</h3>
						<ul>
							{this.props.data.preEventChecklistItems.map((item, index) => {
								return (
									<li key={index}>{item}</li>
								);
							})}
						</ul>
					</section>
				</div>
			</CollapseComponent>
		);
	}
}
