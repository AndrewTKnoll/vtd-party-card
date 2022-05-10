import React, { Component, ReactNode } from "react";
import { createPortal } from "react-dom";

import { ContextData, injectContext } from "components/globalContext";
import { LoginComponent } from "components/loginComponent";
import { RoomSelectComponent } from "components/controls/roomSelectComponent";
import { PlayerListComponent } from "components/playerList/playerListComponent";
import { RoomComponent } from "components/room/roomComponent";
import { SettingsComponent } from "components/settings/settingsComponent";
import { CallbackComponent } from "components/widgets/callbackComponent";

type VTDPartyCardComponentProps = ContextData & {
	settingsContainer: Element;
}

export const VTDPartyCardComponent = injectContext(class extends Component<VTDPartyCardComponentProps> {

	override componentDidUpdate(prevProps: VTDPartyCardComponentProps) {
		this.props.data.save();
	}

	private handleDiceRollerError(error: string, auth: boolean) {
		alert(error);

		if (auth) {
			this.props.data.diceRoller.authToken = undefined;
			this.forceUpdate();
		}
	}

	override render(): ReactNode {
		return <>
			<CallbackComponent registry={this.props.data.diceRoller.errorCallbacks}
				callback={this.handleDiceRollerError.bind(this)}/>
			{createPortal(
				<SettingsComponent data={this.props.data}
					settings={this.props.settings}/>,
				this.props.settingsContainer
			)}
			{this.props.data.diceRoller.authToken ? <>
				<PlayerListComponent partyCard={this.props.data.partyCard}
					currentRoom={this.props.data.currentRoom}
					onChange={this.forceUpdate.bind(this)}/>
				<RoomSelectComponent data={this.props.data}
					onChange={this.forceUpdate.bind(this)}/>
				<RoomComponent data={this.props.data}
					settings={this.props.settings}
					currentRoom={this.props.data.currentRoom}
					onChange={this.forceUpdate.bind(this)}/>
			</> :
				<LoginComponent diceRoller={this.props.data.diceRoller}
					onLogin={this.forceUpdate.bind(this)}/>
			}
		</>;
	}
});
