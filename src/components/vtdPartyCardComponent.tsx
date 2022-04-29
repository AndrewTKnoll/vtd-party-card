import React, { Component, ReactNode } from "react";
import { createPortal } from "react-dom";

import { LoginComponent } from "components/loginComponent";
import { RoomSelectComponent } from "components/controls/roomSelectComponent";
import { PlayerListComponent } from "components/playerList/playerListComponent";
import { RoomComponent } from "components/room/roomComponent";
import { CallbackComponent } from "components/widgets/callbackComponent";

import { DataManager } from "model/dataManager";

interface VTDPartyCardComponentProps {
	data: DataManager;
	versionElement: Element;
}
interface VTDPartyCardComponentState {}

export class VTDPartyCardComponent extends Component<VTDPartyCardComponentProps, VTDPartyCardComponentState> {

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
			{this.props.data.diceRoller.authToken ? <>
				{createPortal(this.props.data.dungeon.dataVersion, this.props.versionElement)}
				<PlayerListComponent partyCard={this.props.data.partyCard}
					currentRoom={this.props.data.currentRoom}
					onChange={this.forceUpdate.bind(this)}/>
				<RoomSelectComponent data={this.props.data}
					onChange={this.forceUpdate.bind(this)}/>
				<RoomComponent data={this.props.data}
					currentRoom={this.props.data.currentRoom}
					onChange={this.forceUpdate.bind(this)}/>
			</> :
				<LoginComponent diceRoller={this.props.data.diceRoller}
					onLogin={this.forceUpdate.bind(this)}/>
			}
		</>;
	}
}
