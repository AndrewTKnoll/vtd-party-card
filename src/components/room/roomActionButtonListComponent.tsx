import React, { Component, ReactNode } from "react";

import { CallbackComponent } from "components/widgets/callbackComponent";

import { DiceRoller } from "model/diceRoller/diceRoller";
import { RollState } from "model/diceRoller/rollState";
import { RollType } from "model/diceRoller/rollType";

interface RoomActionButtonListComponentProps {
	diceRoller: DiceRoller;
	rollType: RollType | undefined;
	cancelAction: () => void;
	completeAction: () => void;
}

export class RoomActionButtonListComponent extends Component<RoomActionButtonListComponentProps, RollState> {
	private shouldRequestRolls = false;

	/* lifecycle */

	constructor(props: RoomActionButtonListComponentProps) {
		super(props);

		this.state = props.diceRoller.rollState;
	}

	override componentDidMount() {
		if (this.props.rollType === undefined || this.currentStateMatches || !this.props.diceRoller.slotId) {
			return;
		}

		switch (this.state.type) {
			case "disabled":
			case "showSlotId":
				this.props.diceRoller.acceptRolls(this.props.rollType);
				return;
		}

		this.shouldRequestRolls = true;
		this.props.diceRoller.resetRolls();
	}

	override componentWillUnmount() {
		if (this.props.rollType !== undefined && this.props.diceRoller.slotId) {
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
		if (this.state.type === "disabled" || this.state.type === "showSlotId") {
			return false;
		}
		if (this.state.rollType.type !== this.props.rollType.type) {
			return false;
		}
		if (this.state.rollType.type === "save" && this.props.rollType.type === "save" && this.state.rollType.save !== this.props.rollType.save) {
			return false;
		}

		return true;
	}

	/* rendering */

	override render(): ReactNode {
		const buttonsDisabled = !this.currentStateMatches || (this.state.type === "reveal" && this.state.complete);

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
