import React, { Component, ReactNode, ChangeEvent } from "react";

import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";
import { ValidatedTextInput } from "components/controls/validatedTextInput";
import { DiceRollerControlComponent } from "components/diceRoller/diceRollerControlComponent";
import { CallbackComponent } from "components/widgets/callbackComponent";
import { TimerComponent } from "components/widgets/timerComponent";

import { DataManager } from "model/dataManager";
import { nameForClass } from "model/partyCard/class";
import { Player } from "model/partyCard/player";
import { Difficulty, allDifficulties, nameForDifficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { roomTimeDuration } from "model/dungeon/room";

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
		this.props.data.localOffsetStartTime = event.target.value ? new Date(event.target.value) : undefined;
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

	private updateSlotId(newValue: string) {
		this.props.data.diceRoller.slotId = newValue.toLowerCase();
		this.props.onChange();
	}

	private updateAfterRoll() {
		this.forceUpdate();
	}

	private renderRollList(player: Player): ReactNode {
		let hasRoll = false;

		this.props.data.diceRoller.rolls.forEach((roll) => {
			hasRoll = hasRoll || roll.class === player.class;
		});

		return <li key={player.class}>
			<input type="checkbox"
				disabled={true}
				checked={hasRoll}/>
			{nameForClass(player.class)}
		</li>;
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

		return <div className="setup row">
			<CallbackComponent registry={this.props.data.diceRoller.rollCallbacks}
				callback={this.updateAfterRoll.bind(this)}/>
			<CallbackComponent registry={this.props.data.diceRoller.stateCallbacks}
				callback={this.updateAfterRoll.bind(this)}/>
			<div className="setup__main-col col">
				<div className="row">
					<div className="setup__settings-col col">
						<section className="info-box">
							<h3>Settings</h3>
							<div className="room-component__info-line">
								<button type="button"
									onClick={this.fullReset.bind(this)}>

									Full Reset
								</button>
								<label>
									Difficulty:

									<ItemListSelectComponent items={allDifficulties}
										labelForItem={nameForDifficulty}
										selectedItem={this.props.data.difficulty}
										onChange={this.setDifficulty.bind(this)}/>
								</label>
							</div>
							<div className="room-component__info-line">
								<button type="button"
									onClick={this.prepareForParty.bind(this)}>

									Prepare Dungeon for Party
								</button>
							</div>
							<div className="room-component__info-line">
								<span>
									{`Event Password: ${this.props.data.dungeon.eventPasswords[this.props.data.difficulty]}`}
								</span>
								<button type="button"
									onClick={this.copyPasswordToClipboard.bind(this)}>

									Copy to Clipboard
								</button>
							</div>
							<div className="room-component__info-line">
								<span>
									Skill Test Links
								</span>
								<button type="button"
									onClick={this.copySkillTestsToClipboard.bind(this)}>

									Copy to Clipboard
								</button>
							</div>
						</section>
					</div>
					<div className="setup__time-col col">
						<section className="info-box">
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
				<section className="info-box">
					<h3>Pre-Event Checklist</h3>
					<ul>
						{this.props.data.preEventChecklistItems.map((item, index) => {
							return <li key={index}>{item}</li>;
						})}
					</ul>
				</section>
			</div>
			<section className="setup__dice-roller-col col">
				<h3>Dice Roller</h3>
				<div className="row">
					<div className="setup__dice-roller-controller col">
						<DiceRollerControlComponent diceRoller={this.props.data.diceRoller}/>
					</div>
					<div className="setup__dice-roller-roll-list col">
						<h4>Rolls Received</h4>
						<ul>
							{this.props.data.partyCard.presentPlayers.map(this.renderRollList.bind(this))}
						</ul>
					</div>
				</div>
			</section>
		</div>;
	}
}
