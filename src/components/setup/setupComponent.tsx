import React, { Component, ReactNode, ChangeEvent } from "react";

import { ContextData, injectContext } from "components/globalContext";
import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";
import { ValidatedTextInput } from "components/controls/validatedTextInput";
import { DiceRollerControlComponent } from "components/diceRoller/diceRollerControlComponent";
import { CallbackComponent } from "components/widgets/callbackComponent";
import { TimerComponent } from "components/widgets/timerComponent";

import { slotIdPattern } from "model/diceRoller/diceRoller";
import { nameForClass } from "model/partyCard/class";
import { Player } from "model/partyCard/player";
import { Difficulty, allDifficulties, nameForDifficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { roomTimeDuration } from "model/dungeon/room";

export const SetupComponent = injectContext(class extends Component<ContextData> {

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
		navigator.clipboard.writeText([
			"https://truedungeon.com/files/Bard_Skill_Test.pdf",
			"https://truedungeon.com/files/Cleric_Skill_Test.pdf",
			"https://truedungeon.com/files/Druid_Skill_Test.pdf",
			"https://truedungeon.com/files/Wizard_Skill_Test.pdf"
		].join("\n"));
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

	private updateInitiativeBonus(event: ChangeEvent<HTMLInputElement>) {
		const newValue = isNaN(event.target.valueAsNumber) ? 0 : Math.round(event.target.valueAsNumber);

		this.props.data.partyCard.initiativeBonus = newValue;

		event.target.valueAsNumber = newValue;
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
							<h3>Party Settings</h3>
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
							{this.props.settings.checkInitiativeBonus &&
								<label className="room-component__info-line">
									Initiative Bonus:
									<input type="number"
										className="setup__initiative-value"
										value={this.props.data.partyCard.initiativeBonus}
										onChange={this.updateInitiativeBonus.bind(this)}/>
								</label>
							}
						</section>
					</div>
					<div className="setup__time-col col">
						<section className="info-box">
							<h3>Timeslot Settings</h3>
							<h4>Dice Roller Slot ID:</h4>
							<ValidatedTextInput value={this.props.data.diceRoller.slotId?.toUpperCase() || ""}
								validation={slotIdPattern}
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
						<li>Difficulty set?</li>
						<li>Party card filled out?</li>
						<li>Bard instrument set?</li>
						<li>Initiative tzar selected?</li>
						<li>Paladin default guard?</li>
						<li>Strict horn reminder</li>
						<li>Adventure codeword entered?</li>
						<li>Dice roller codeword entered?</li>
						<li>Remember to move rooms</li>
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
});
