import React, { Component, ReactNode, ChangeEvent } from "react";

interface ValidatedTextInputProps {
	value: string;
	validation: RegExp;
	onChange: (newValue: string) => void;
}
interface ValidatedTextInputState {
	draftValue: string;
}

export class ValidatedTextInput extends Component<ValidatedTextInputProps, ValidatedTextInputState> {

	constructor(props: ValidatedTextInputProps) {
		super(props);

		this.state = {
			draftValue: props.value
		};
	}

	private inputValueChanged(event: ChangeEvent<HTMLInputElement>) {
		this.setState({
			draftValue: event.target.value
		});
	}

	override render(): ReactNode {
		return (
			<div className="validated-text-input">
				{this.props.value.length > 0 &&
					<span>{this.props.value}</span>
				}
				<input type="text"
					value={this.state.draftValue}
					onChange={this.inputValueChanged.bind(this)}/>
				<button type="button"
					disabled={!this.props.validation.test(this.state.draftValue)}
					onClick={this.props.onChange.bind(this, this.state.draftValue)}>

					Update
				</button>
			</div>
		);
	}
}
