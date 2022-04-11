import React, { Component, ReactNode } from "react";

import { DataManager } from "model/dataManager";
import { Roll } from "model/diceRoller/roll";
import { InitiativeWinner } from "model/dungeon/room";

interface InitiativeActionComponentProps {
	data: DataManager;
	clearAction: () => void;
	onChange: () => void;
	triggerQuickStrike: (() => void);
}
interface InitiativeActionComponentState {
	monsterRoll: number;
	playerRoll: { dieResult: number, total: number } | undefined;
}

export class InitiativeActionComponent extends Component<InitiativeActionComponentProps, InitiativeActionComponentState> {
	private rollCallbackId!: number;

	/* lifecycle */

	constructor(props: InitiativeActionComponentProps) {
		super(props);

		this.state = {
			monsterRoll: Math.floor(Math.random() * 20) + 1,
			playerRoll: undefined
		};
	}

	override componentDidMount() {
		this.rollCallbackId = this.props.data.diceRoller.rollCallbacks.register(this.handlePlayerRoll.bind(this));

		this.props.data.diceRoller.rolls.forEach(this.handlePlayerRoll.bind(this));
	}

	override componentDidUpdate(prevProps: InitiativeActionComponentProps) {
		if (prevProps.data.diceRoller !== this.props.data.diceRoller) {
			prevProps.data.diceRoller.rollCallbacks.unregister(this.rollCallbackId);
			this.rollCallbackId = this.props.data.diceRoller.rollCallbacks.register(this.handlePlayerRoll.bind(this));
		}
	}

	override componentWillUnmount() {
		this.props.data.diceRoller.rollCallbacks.unregister(this.rollCallbackId);
	}

	/* events */

	private handlePlayerRoll(roll: Roll) {
		if (roll.type !== "initiative") {
			return;
		}

		this.setState({
			playerRoll: {
				dieResult: roll.dieResult,
				total: roll.modifiedResult
			}
		});
	}

	private completeInitiative(quickStrike: boolean) {
		this.props.data.currentRoom.initiativeWinner = this.winner;
		this.props.clearAction();
		this.props.onChange();

		if (quickStrike) {
			this.props.triggerQuickStrike();
		}
	}

	/* values */

	private get monsterTotal(): number {
		return this.state.monsterRoll + this.props.data.currentRoom.initiativeBonus;
	}

	private get winner(): InitiativeWinner | undefined {
		if (!this.state.playerRoll || this.monsterTotal === this.state.playerRoll.total) {
			return undefined;
		}
		return (this.state.playerRoll.total > this.monsterTotal) ? InitiativeWinner.players : InitiativeWinner.monster;
	}

	/* rendering */

	private resultText(): string {
		if (!this.state.playerRoll) {
			return "Waiting";
		}

		if (this.monsterTotal === this.state.playerRoll.total) {
			return "Tie - Roll Off";
		}

		return (this.monsterTotal > this.state.playerRoll.total) ? "Monster Wins" : `Players Win${this.state.playerRoll.dieResult >= 15 ? " (Quick Strike)" : ""}`;
	}

	private quickStrikeAllowed(): boolean {
		const playersHaveQuickStrike = this.props.data.partyCard.activePlayers.reduce((found, player) => {
			return found || player.hasQuickStrike;
		}, false);

		return playersHaveQuickStrike &&
			this.winner === InitiativeWinner.players &&
			this.state.playerRoll !== undefined &&
			this.state.playerRoll.dieResult >= 15;
	}

	override render(): ReactNode {
		return <>
			<h3>Initiative</h3>
			<div className="action-button-list">
				<button type="button"
					onClick={this.props.clearAction}>

					Cancel
				</button>
				<button type="button"
					onClick={this.completeInitiative.bind(this, false)}>

					Complete
				</button>
			</div>
			<div className="initiative-action-component row">
				<div className="initiative-action-component__roll col">
					<h4>Monster Roll</h4>
					{`${this.state.monsterRoll} (${this.monsterTotal})`}
				</div>
				<div className="initiative-action-component__roll col">
					<h4>Player Roll</h4>
					{this.state.playerRoll ? `${this.state.playerRoll.total} (${this.state.playerRoll.dieResult})` : "?? (??)"}
				</div>
				<div className="initiative-action-component__result">
					{this.resultText()}
				</div>
				{this.quickStrikeAllowed() &&
					<button type="button"
						className="initiative-action-component__quick-strike-button"
						onClick={this.completeInitiative.bind(this, true)}>

						Start Quick Strike Round
					</button>
				}
			</div>
		</>;
	}
}
