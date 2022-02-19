import React, { Component, ReactNode } from "react";

import { InitiativeAction } from "model/roomAction/initiativeAction";

interface InitiativeActionComponentProps {
	action: InitiativeAction;
}
interface InitiativeActionComponentState {}

export class InitiativeActionComponent extends Component<InitiativeActionComponentProps, InitiativeActionComponentState> {

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
			</div>
		</>);
	}
}
