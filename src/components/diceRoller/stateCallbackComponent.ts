import { Component, ReactNode } from "react";

import { DiceRoller } from "model/diceRoller/diceRoller";

interface StateCallbackComponentProps {
	diceRoller: DiceRoller;
	handleStateChange: () => void;
}
interface StateCallbackComponentState {}

export class StateCallbackComponent extends Component<StateCallbackComponentProps, StateCallbackComponentState> {
	private callbackId!: number;

	override componentDidMount() {
		this.callbackId = this.props.diceRoller.stateCallbacks.register(this.props.handleStateChange);
	}

	override componentDidUpdate(prevProps: StateCallbackComponentProps) {
		if (prevProps.diceRoller !== this.props.diceRoller) {
			prevProps.diceRoller.stateCallbacks.unregister(this.callbackId);
			this.callbackId = this.props.diceRoller.stateCallbacks.register(this.props.handleStateChange);
			this.props.handleStateChange();
		}
	}

	override componentWillUnmount() {
		this.props.diceRoller.stateCallbacks.unregister(this.callbackId);
	}

	/* rendering */

	override render(): ReactNode {
		return undefined;
	}
}
