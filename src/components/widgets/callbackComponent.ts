import { Component, ReactNode } from "react";

import { CallbackRegistry } from "utilities/callbackRegistry";

interface CallbackComponentProps<CallbackType extends (...args: any[]) => any> {
	registry: CallbackRegistry<CallbackType>;
	callback: CallbackType;
}

export class CallbackComponent<CallbackType extends (...args: any[]) => any> extends Component<CallbackComponentProps<CallbackType>> {
	private callbackId!: number;

	override componentDidMount() {
		this.callbackId = this.props.registry.register(this.props.callback);
	}

	override componentDidUpdate(prevProps: CallbackComponentProps<CallbackType>) {
		if (prevProps.registry !== this.props.registry) {
			prevProps.registry.unregister(this.callbackId);
			this.callbackId = this.props.registry.register(this.props.callback);
		}
	}

	override componentWillUnmount() {
		this.props.registry.unregister(this.callbackId);
	}

	/* rendering */

	override render(): ReactNode {
		return undefined;
	}
}
