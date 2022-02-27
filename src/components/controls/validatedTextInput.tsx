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
			draftValue: ""
		};
	}

	private inputValueChanged(event: ChangeEvent<HTMLInputElement>) {
		this.setState({
			draftValue: event.target.value
		});
	}

	private updateButtonClicked() {
		this.props.onChange(this.state.draftValue);
		this.setState({
			draftValue: ""
		});
	}

	override render(): ReactNode {
		return (
			<div className="validated-text-input">
				<input type="text"
					value={this.state.draftValue}
					onChange={this.inputValueChanged.bind(this)}/>
				<button type="button"
					disabled={!this.props.validation.test(this.state.draftValue)}
					onClick={this.updateButtonClicked.bind(this)}>

					Update
				</button>
				{this.props.value.length > 0 &&
					<span>{this.props.value}</span>
				}
			</div>
		);
	}
}
