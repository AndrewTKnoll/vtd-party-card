import React, { Component, ReactNode } from "react";

import { RollCallbackComponent } from "components/diceRoller/rollCallbackComponent";
import { RoomActionButtonListComponent } from "components/room/roomActionButtonListComponent";

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

	/* lifecycle */

	constructor(props: InitiativeActionComponentProps) {
		super(props);

		this.state = {
			monsterRoll: Math.floor(Math.random() * 20) + 1,
			playerRoll: undefined
		};
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
			<RollCallbackComponent diceRoller={this.props.data.diceRoller}
				handleRoll={this.handlePlayerRoll.bind(this)}/>
			<h3>Initiative</h3>
			<RoomActionButtonListComponent diceRoller={this.props.data.diceRoller}
				rollType={{type: "initiative"}}
				cancelAction={this.props.clearAction}
				completeAction={this.completeInitiative.bind(this, false)}/>
			<div className="initiative-action-component row">
				<div className="initiative-action-component__roll col">
					<h4>Monster Roll</h4>
					{`${this.monsterTotal} (${this.state.monsterRoll})`}
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
