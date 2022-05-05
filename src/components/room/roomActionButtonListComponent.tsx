import React, { Component, ReactNode } from "react";

import { CallbackComponent } from "components/widgets/callbackComponent";

import { SettingsManager } from "model/settingsManager";
import { DiceRoller } from "model/diceRoller/diceRoller";
import { RollType } from "model/diceRoller/rollType";

interface RoomActionButtonListComponentProps {
	settings: SettingsManager;
	diceRoller: DiceRoller;
	rollType: RollType | undefined;
	cancelAction: () => void;
	completeAction: () => void;
}
interface RoomActionButtonListComponentState {}

export class RoomActionButtonListComponent extends Component<RoomActionButtonListComponentProps, RoomActionButtonListComponentState> {
	private shouldRequestRolls = false;

	/* lifecycle */

	override componentDidMount() {
		if (!this.props.settings.roomActionAutomaticDiceRoller || this.props.rollType === undefined || this.currentStateMatches || !this.props.diceRoller.slotId) {
			return;
		}

		switch (this.props.diceRoller.rollState.type) {
			case "disabled":
			case "showSlotId":
				this.props.diceRoller.acceptRolls(this.props.rollType);
				return;
		}

		this.shouldRequestRolls = true;
		this.props.diceRoller.resetRolls();
	}

	override componentWillUnmount() {
		if (this.props.settings.roomActionAutomaticDiceRoller && this.props.rollType !== undefined && this.props.diceRoller.slotId) {
			this.props.diceRoller.resetRolls();
		}
	}

	/* events */

	private updateRollState() {
		this.setState(this.props.diceRoller.rollState);

		if (!this.shouldRequestRolls || this.props.rollType === undefined || this.props.diceRoller.rollState.type !== "disabled") {
			return;
		}

		this.shouldRequestRolls = false;
		this.props.diceRoller.acceptRolls(this.props.rollType);
	}

	private revealRolls(instant: boolean) {
		this.props.diceRoller.revealRolls(instant);
	}

	/* values */

	private get currentStateMatches(): boolean {
		if (this.props.rollType === undefined) {
			return false;
		}

		const currentRollState = this.props.diceRoller.rollState;

		if (currentRollState.type === "disabled" || currentRollState.type === "showSlotId") {
			return false;
		}
		if (currentRollState.rollType.type !== this.props.rollType.type) {
			return false;
		}
		if (currentRollState.rollType.type === "save" && this.props.rollType.type === "save" && currentRollState.rollType.save !== this.props.rollType.save) {
			return false;
		}

		return true;
	}

	/* rendering */

	override render(): ReactNode {
		const currentRollState = this.props.diceRoller.rollState;

		const buttonsDisabled = !this.currentStateMatches || (currentRollState.type === "reveal" && currentRollState.complete);

		return <div className="room-action-button-list-component">
			<CallbackComponent registry={this.props.diceRoller.stateCallbacks}
				callback={this.updateRollState.bind(this)}/>
			<button type="button"
				onClick={this.props.cancelAction}>

				Cancel Action
			</button>
			<button type="button"
				onClick={this.props.completeAction}>

				Complete Action
			</button>
			{this.props.rollType !== undefined && <>
				{this.props.rollType.type !== "initiative" &&
					<button type="button"
						disabled={buttonsDisabled}
						onClick={this.revealRolls.bind(this, false)}>

						Reveal Next Roll
					</button>
				}
				<button type="button"
					disabled={buttonsDisabled}
					onClick={this.revealRolls.bind(this, true)}>

					{`Reveal ${this.props.rollType.type === "initiative" ? "Roll" : "All Rolls"}`}
				</button>
			</>}
		</div>;
	}
}
