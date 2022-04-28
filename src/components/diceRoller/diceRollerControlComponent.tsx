import React, { Component, ReactNode } from "react";

import { CallbackComponent } from "components/widgets/callbackComponent";

import { SaveType } from "model/attributes/saveType";
import { DiceRoller } from "model/diceRoller/diceRoller";
import { RollState } from "model/diceRoller/rollState";

interface DiceRollerControlComponentProps {
	diceRoller: DiceRoller;
}

export class DiceRollerControlComponent extends Component<DiceRollerControlComponentProps, RollState> {

	constructor(props: DiceRollerControlComponentProps) {
		super(props);

		this.state = props.diceRoller.rollState;
	}

	private updateRollState() {
		this.setState(this.props.diceRoller.rollState);
	}

	private acceptRolls(type: "initiative" | "attack") {
		this.props.diceRoller.acceptRolls({
			type: type
		});
	}

	private acceptSaveRolls(type: SaveType) {
		this.props.diceRoller.acceptRolls({
			type: "save",
			save: type
		});
	}

	private showSlotCode(show: boolean) {
		this.props.diceRoller.showSlotIdInOBS(show);
	}

	private revealRolls(instant: boolean) {
		this.props.diceRoller.revealRolls(instant);
	}

	private resetRolls() {
		this.props.diceRoller.resetRolls();
	}

	override render(): ReactNode {
		const rollsRevealed = (this.state.type === "reveal");
		const revealComplete = (this.state.type === "reveal") && this.state.complete;

		const acceptingRolls = (this.state.type === "accept");
		const slotCodeShown = (this.state.type === "showSlotId");

		const isInitiativeRoll = (this.state.type === "accept" || this.state.type === "reveal") && (this.state.rollType.type === "initiative");

		return <>
			<CallbackComponent registry={this.props.diceRoller.stateCallbacks}
				callback={this.updateRollState.bind(this)}/>
			<div className="dice-roller-control-component row">
				{!rollsRevealed && !acceptingRolls && <>
					<div className="col">
						<button type="button"
							onClick={this.acceptRolls.bind(this, "initiative")}>

							Get Initiative Roll
						</button>
						<button type="button"
							onClick={this.acceptRolls.bind(this, "attack")}>

							Get Attack Rolls
						</button>
						<button type="button"
							onClick={this.showSlotCode.bind(this, !slotCodeShown)}>

							{slotCodeShown ? "Hide Slot Code" : "Show Slot Code"}
						</button>
					</div>
					<div className="col">
						<button type="button"
							onClick={this.acceptSaveRolls.bind(this, SaveType.fortitude)}>

							Get Fortitude Saves
						</button>
						<button type="button"
							onClick={this.acceptSaveRolls.bind(this, SaveType.reflex)}>

							Get Reflex Saves
						</button>
						<button type="button"
							onClick={this.acceptSaveRolls.bind(this, SaveType.will)}>

							Get Will Saves
						</button>
					</div>
				</>}
				{(rollsRevealed || acceptingRolls) &&
					<div className="col">
						{!revealComplete && <>
							{!isInitiativeRoll &&
								<button type="button"
									onClick={this.revealRolls.bind(this, false)}>

									Reveal Next Roll
								</button>
							}
							<button type="button"
								onClick={this.revealRolls.bind(this, true)}>

								{isInitiativeRoll ? "Reveal Roll" : "Reveal Rolls Instantly"}
							</button>
						</>}
						<button type="button"
							onClick={this.resetRolls.bind(this)}>

							Clear Rolls
						</button>
					</div>
				}
			</div>
		</>;
	}
}
