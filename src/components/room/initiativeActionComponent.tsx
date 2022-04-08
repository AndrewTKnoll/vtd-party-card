import React, { Component, ReactNode } from "react";

import { DiceRoller } from "model/diceRoller/diceRoller";
import { Roll } from "model/diceRoller/roll";
import { InitiativeWinner } from "model/dungeon/room";
import { InitiativeAction } from "model/roomAction/initiativeAction";

interface InitiativeActionComponentProps {
	action: InitiativeAction;
	diceRoller: DiceRoller;
	triggerQuickStrike: (() => void) | undefined;
}
interface InitiativeActionComponentState {}

export class InitiativeActionComponent extends Component<InitiativeActionComponentProps, InitiativeActionComponentState> {
	private rollCallbackId!: number;

	override componentDidMount() {
		this.rollCallbackId = this.props.diceRoller.rollCallbacks.register(this.handlePlayerRoll.bind(this));

		this.props.diceRoller.rolls.forEach(this.handlePlayerRoll.bind(this));
	}

	override componentDidUpdate(prevProps: InitiativeActionComponentProps) {
		if (prevProps.diceRoller !== this.props.diceRoller) {
			prevProps.diceRoller.rollCallbacks.unregister(this.rollCallbackId);
			this.rollCallbackId = this.props.diceRoller.rollCallbacks.register(this.handlePlayerRoll.bind(this));
		}
	}

	override componentWillUnmount() {
		this.props.diceRoller.rollCallbacks.unregister(this.rollCallbackId);
	}

	private handlePlayerRoll(roll: Roll) {
		if (roll.type !== "initiative") {
			return;
		}

		this.props.action.playerRollReceived = true;
		this.props.action.playerRoll = roll.dieResult;
		this.props.action.playerTotal = roll.modifiedResult;

		this.forceUpdate();
	}

	private resultText(): string {
		if (!this.props.action.playerRollReceived) {
			return "Waiting";
		}

		const { monsterTotal, playerTotal, playerRoll } = this.props.action;

		if (monsterTotal === playerTotal) {
			return "Tie - Roll Off";
		}

		return (monsterTotal > playerTotal) ? "Monster Wins" : `Players Win${playerRoll >= 15 ? " (Quick Strike)" : ""}`;
	}

	private quickStrikeAllowed(): boolean {
		return this.props.triggerQuickStrike !== undefined &&
			this.props.action.winner === InitiativeWinner.players &&
			this.props.action.playerRoll >= 15;
	}

	override render(): ReactNode {
		return (<>
			<h3>Initiative</h3>
			<div className="initiative-action-component row">
				<div className="initiative-action-component__roll col">
					<h4>Monster Roll</h4>
					{`${this.props.action.monsterRoll} (${this.props.action.monsterTotal})`}
				</div>
				<div className="initiative-action-component__roll col">
					<h4>Player Roll</h4>
					{this.props.action.playerRollReceived ? `${this.props.action.playerRoll} (${this.props.action.playerTotal})` : "?? (??)"}
				</div>
				<div className="initiative-action-component__result">
					{this.resultText()}
				</div>
				{this.quickStrikeAllowed() &&
					<button type="button"
						className="initiative-action-component__quick-strike-button"
						onClick={this.props.triggerQuickStrike}>

						Start Quick Strike Round
					</button>
				}
			</div>
		</>);
	}
}
