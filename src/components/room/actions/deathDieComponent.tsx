import React, { Component, ReactNode } from "react";

import { RollCallbackComponent } from "components/diceRoller/rollCallbackComponent";

import { DataManager } from "model/dataManager";
import { Roll } from "model/diceRoller/roll";
import { Class } from "model/partyCard/class";

interface DeathDieComponentProps {
	data: DataManager;
	clearAction: () => void;
	onChange: () => void;
}
interface DeathDieComponentState {
	playerRoll: { roll: number, class: Class } | undefined;
}

export class DeathDieComponent extends Component<DeathDieComponentProps, DeathDieComponentState> {

	/* lifecycle */

	constructor(props: DeathDieComponentProps) {
		super(props);

		this.state = {
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
				roll: roll.dieResult,
				class: roll.class
			}
		});
	}

	private completeDeathDie() {
		if (this.state.playerRoll && this.state.playerRoll.roll > 10) {
			this.props.data.partyCard.player(this.state.playerRoll.class).isDead = false;
		}

		this.props.clearAction();
		this.props.onChange();
	}

	/* rendering */

	private rangeText(): string {
		if (this.state.playerRoll === undefined) {
			return "";
		}
		if (this.state.playerRoll.roll <= 10) {
			return "1-10";
		}
		if (this.state.playerRoll.roll <= 19) {
			return "11-19";
		}
		return "20";
	}

	private resultText(): string {
		if (this.state.playerRoll === undefined) {
			return "";
		}
		if (this.state.playerRoll.roll <= 10) {
			return "Character is still dead";
		}
		if (this.state.playerRoll.roll <= 19) {
			return "Character is raised with 1 HP";
		}
		return "Character is raised with full HP";
	}

	override render(): ReactNode {
		return <>
			<RollCallbackComponent diceRoller={this.props.data.diceRoller}
				handleRoll={this.handlePlayerRoll.bind(this)}/>
			<h3>Druegar's Death Die</h3>
			<div className="action-button-list">
				<button type="button"
					onClick={this.props.clearAction}>

					Cancel
				</button>
				<button type="button"
					onClick={this.completeDeathDie.bind(this)}>

					Complete
				</button>
			</div>
			<div className="death-die-component">
				<h4>Roll</h4>
				{this.state.playerRoll === undefined && <p>Waiting for Roll</p> }
				{this.state.playerRoll !== undefined && <>
					<p className="death-die-component__roll">
						{this.state.playerRoll.roll}
					</p>
					<p>
						<span className="death-die-component__result-range">
							{this.rangeText()}:
						</span>
						{this.resultText()}
					</p>
					<a href="https://tokendb.com/token/druegars-death-die/"
						target="_blank">

						Full Description
					</a>
				</>}
			</div>
		</>;
	}
}
