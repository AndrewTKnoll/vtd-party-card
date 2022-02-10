import React, { Component, ReactNode, ChangeEvent } from "react";

import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";
import { CollapseComponent } from "components/structure/collapseComponent";
import { TimerComponent } from "components/widgets/timerComponent";

import { Difficulty, allDifficulties, nameForDifficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { roomTimeDuration } from "model/dungeon/room";
import { DataManager } from "model/dataManager";

const timezoneOffsetScale = 60 * 1000;

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
		const rawDate = new Date(event.target.value);
		const offset = this.props.data.dungeon.timezoneOffset - rawDate.getTimezoneOffset();

		this.props.data.startTime = new Date(rawDate.getTime() + (offset * timezoneOffsetScale));
		this.props.onChange();
	}

	private fullReset() {
		if (confirm("Confirm Reset")) {
			this.props.data.reset(ResetLevel.full);
			this.props.onChange();
		}
	}

	private copyPasswordToClipboard() {
		navigator.clipboard.writeText(this.props.data.dungeon.eventPasswords[this.props.data.difficulty]);
	}

	private copySkillTestsToClipboard() {
		navigator.clipboard.writeText(this.props.data.skillTestLinks.join("\n"));
	}

	override render(): ReactNode {
		let dateString = "";
		let room1StartTime;
		let introVideoStartTime;
		let recapVideoStartTime;

		if (this.props.data.startTime) {
			dateString = (new Date(
				this.props.data.startTime.getTime() - this.props.data.dungeon.timezoneOffset * timezoneOffsetScale
			)).toISOString().substring(0, 16);

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
				contentClass="row">

				<div className="col">
					<button type="button"
						onClick={this.fullReset.bind(this)}>

						Full Reset
					</button>
				</div>
				<label className="col">
					Difficulty:

					<ItemListSelectComponent isOptional={false}
						items={allDifficulties}
						labelForItem={nameForDifficulty}
						selectedItem={this.props.data.difficulty}
						onChange={this.setDifficulty.bind(this)}/>
				</label>
				<div className="col">
					<span>
						{`Event Password: ${this.props.data.dungeon.eventPasswords[this.props.data.difficulty]}`}
					</span>
					<button type="button"
						onClick={this.copyPasswordToClipboard.bind(this)}>

						Copy to Clipboard
					</button>
				</div>
				<div className="col">
					<span>
						Skill Test Links
					</span>
					<button type="button"
						onClick={this.copySkillTestsToClipboard.bind(this)}>

						Copy to Clipboard
					</button>
				</div>
				<div className="col">
					<h3>
						Event Times
					</h3>
					<label>
						Ticket Start Time:
						<input type="datetime-local"
							value={dateString}
							onChange={this.startTimeChanged.bind(this)}/>
					</label>
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
				</div>
				<div className="col">
					<h3>
						Pre-Event Checklist
					</h3>
					<ul>
						{this.props.data.preEventChecklistItems.map((item, index) => {
							return (
								<li key={index}>{item}</li>
							);
						})}
					</ul>
				</div>
			</CollapseComponent>
		);
	}
}
