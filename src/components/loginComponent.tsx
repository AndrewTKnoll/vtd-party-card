import React, { Component, ReactNode, ChangeEvent } from "react";

import { DiceRoller } from "model/diceRoller/diceRoller";

interface LoginComponentProps {
	diceRoller: DiceRoller;
	onLogin: () => void;
}
interface LoginComponentState {
	isLoggingIn: boolean;
	password: string;
}

export class LoginComponent extends Component<LoginComponentProps, LoginComponentState> {

	constructor(props: LoginComponentProps) {
		super(props);

		this.state = {
			isLoggingIn: false,
			password: ""
		};
	}

	private passwordChanged(event: ChangeEvent<HTMLInputElement>) {
		this.setState({
			password: event.target.value
		});
	}

	private async logIn() {
		this.setState({
			isLoggingIn: true
		});

		await this.props.diceRoller.logIn(this.state.password);

		this.setState({
			isLoggingIn: false
		});

		if (this.props.diceRoller.authToken) {
			this.props.onLogin();
			return;
		}
	}

	override render(): ReactNode {
		return <form onSubmit={(event) => { event.preventDefault(); }}>
			<label>
				Password:
				<input type="password"
					required={true}
					disabled={this.state.isLoggingIn}
					value={this.state.password}
					onChange={this.passwordChanged.bind(this)}/>
			</label>
			<button type="submit"
				disabled={this.state.isLoggingIn}
				onClick={this.logIn.bind(this)}>

				Log In
			</button>
		</form>;
	}
}
