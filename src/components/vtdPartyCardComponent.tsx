import React, { Component, ReactNode, RefObject } from "react";

import { LoginComponent } from "components/loginComponent";
import { RoomSelectComponent } from "components/controls/roomSelectComponent";
import { PlayerListComponent } from "components/playerList/playerListComponent";
import { RoomComponent } from "components/room/roomComponent";

import { DataManager } from "model/dataManager";

interface VTDPartyCardComponentProps {
	data: DataManager;
}
interface VTDPartyCardComponentState {}

export class VTDPartyCardComponent extends Component<VTDPartyCardComponentProps, VTDPartyCardComponentState> {
	private roomComponentRef: RefObject<RoomComponent>;
	private errorCallbackId!: number;

	constructor(props: VTDPartyCardComponentProps) {
		super(props);

		this.roomComponentRef = React.createRef();
	}

	override componentDidMount() {
		this.errorCallbackId = this.props.data.diceRoller.errorCallbacks.register(this.handleDiceRollerError.bind(this));
	}

	override componentDidUpdate(prevProps: VTDPartyCardComponentProps) {
		this.props.data.save();

		if (prevProps.data.diceRoller !== this.props.data.diceRoller) {
			prevProps.data.diceRoller.errorCallbacks.unregister(this.errorCallbackId);
			this.errorCallbackId = this.props.data.diceRoller.errorCallbacks.register(this.handleDiceRollerError.bind(this));
		}
	}

	override componentWillUnmount() {
		this.props.data.diceRoller.errorCallbacks.unregister(this.errorCallbackId);
	}

	private handleDiceRollerError(error: string, auth: boolean) {
		alert(error);

		if (auth) {
			this.props.data.diceRoller.authToken = undefined;
			this.forceUpdate();
		}
	}

	private clearAttackLists() {
		this.roomComponentRef.current?.setAction(undefined);
		this.forceUpdate();
	}

	override render(): ReactNode {
		if (!this.props.data.diceRoller.authToken) {
			return (
				<LoginComponent diceRoller={this.props.data.diceRoller}
					onLogin={this.forceUpdate.bind(this)}/>
			);
		}

		return (<>
			<PlayerListComponent partyCard={this.props.data.partyCard}
				currentRoom={this.props.data.currentRoom}
				onChange={this.forceUpdate.bind(this)}/>
			<RoomSelectComponent data={this.props.data}
				onChange={this.clearAttackLists.bind(this)}/>
			<RoomComponent ref={this.roomComponentRef}
				data={this.props.data}
				onChange={this.forceUpdate.bind(this)}/>
		</>);
	}
}
