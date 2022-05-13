import React, { Component, ReactNode, ChangeEvent } from "react";

import { ContextData, injectContext } from "components/globalContext";
import { RoomActionButtonListComponent } from "components/room/roomActionButtonListComponent";
import { CallbackComponent } from "components/widgets/callbackComponent";

import { Roll, InitiativeRoll } from "model/diceRoller/roll";
import { InitiativeWinner } from "model/dungeon/room";

type InitiativeActionComponentProps = ContextData & {
	clearAction: () => void;
	triggerQuickStrike: (() => void);
}
interface InitiativeActionComponentState {
	monsterRoll: number;
	playerRoll: PlayerInitiativeRoll | undefined;
}

export const InitiativeActionComponent = injectContext(class extends Component<InitiativeActionComponentProps, InitiativeActionComponentState> {

	/* lifecycle */

	constructor(props: InitiativeActionComponentProps) {
		super(props);

		this.state = {
			monsterRoll: Math.floor(Math.random() * 20) + 1,
			playerRoll: undefined
		};
	}

	override componentDidMount() {
		this.props.data.diceRoller.rolls.forEach(this.handlePlayerRoll.bind(this));
	}

	/* events */

	private handlePlayerRoll(roll: Roll) {
		if (roll.type !== "initiative") {
			return;
		}

		this.setState({
			playerRoll: new PlayerInitiativeRoll(roll)
		});
	}

	private alertnessChanged(event: ChangeEvent<HTMLInputElement>) {
		if (this.state.playerRoll) {
			this.state.playerRoll.alertness = event.target.checked;
			this.forceUpdate();
		}
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
			<CallbackComponent registry={this.props.data.diceRoller.rollCallbacks}
				callback={this.handlePlayerRoll.bind(this)}/>
			<h3>Initiative</h3>
			<RoomActionButtonListComponent rollType={{type: "initiative"}}
				cancelAction={this.props.clearAction}
				completeAction={this.completeInitiative.bind(this, false)}/>
			<div className="initiative-action-component row">
				<div className="initiative-action-component__roll col">
					<h4>Monster Roll</h4>
					<p>{`${this.monsterTotal} (${this.state.monsterRoll})`}</p>
				</div>
				<div className="initiative-action-component__roll col">
					<h4>Player Roll</h4>
					<p>{`${this.state.playerRoll?.total ?? "??"} (${this.state.playerRoll?.dieResult ?? "??"})`}</p>
					{this.state.playerRoll !== undefined &&
						<label>
							<input type="checkbox"
								checked={this.state.playerRoll.alertness}
								onChange={this.alertnessChanged.bind(this)}/>
							Alertness
						</label>
					}
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
});

class PlayerInitiativeRoll {
	dieResult: number;
	private modifier: number;
	alertness: boolean;

	get total(): number {
		return this.dieResult + this.modifier + (this.alertness ? 10 : 0);
	}

	constructor(roll: InitiativeRoll) {
		this.dieResult = roll.dieResult;
		this.modifier = roll.modifiedResult - roll.dieResult;
		this.alertness = false;

		if (this.modifier > 10) {
			this.modifier -= 10;
			this.alertness = true;
		}
	}
}
