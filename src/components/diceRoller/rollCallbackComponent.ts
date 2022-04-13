import { Component, ReactNode } from "react";

import { DiceRoller } from "model/diceRoller/diceRoller";
import { Roll } from "model/diceRoller/roll";

interface RollCallbackComponentProps {
	diceRoller: DiceRoller;
	handleRoll: (roll: Roll) => void;
}
interface RollCallbackComponentState {}

export class RollCallbackComponent extends Component<RollCallbackComponentProps, RollCallbackComponentState> {
	private callbackId!: number;

	override componentDidMount() {
		this.callbackId = this.props.diceRoller.rollCallbacks.register(this.props.handleRoll);

		this.props.diceRoller.rolls.forEach(this.props.handleRoll);
	}

	override componentDidUpdate(prevProps: RollCallbackComponentProps) {
		if (prevProps.diceRoller !== this.props.diceRoller) {
			prevProps.diceRoller.rollCallbacks.unregister(this.callbackId);
			this.callbackId = this.props.diceRoller.rollCallbacks.register(this.props.handleRoll);
		}
	}

	override componentWillUnmount() {
		this.props.diceRoller.rollCallbacks.unregister(this.callbackId);
	}

	/* rendering */

	override render(): ReactNode {
		return undefined;
	}
}
