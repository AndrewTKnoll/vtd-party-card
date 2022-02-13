import React, { Component, RefObject } from "react";

import { LoginComponent } from "components/loginComponent";
import { RoomSelectComponent } from "components/controls/roomSelectComponent";
import { PlayerListComponent } from "components/playerList/playerListComponent";
import { RoomComponent } from "components/room/roomComponent";
import { SetupComponent } from "components/setup/setupComponent";

import { DataManager } from "model/dataManager";

interface VDMAssistantComponentProps {
	data: DataManager;
}
interface VDMAssistantComponentState {}

export class VDMAssistantComponent extends Component<VDMAssistantComponentProps, VDMAssistantComponentState> {
	private roomComponentRef: RefObject<RoomComponent>;

	constructor(props: VDMAssistantComponentProps) {
		super(props);

		this.roomComponentRef = React.createRef();
	}

	private clearAttackLists() {
		this.roomComponentRef.current?.clearAttacks();
		this.forceUpdate();
	}

	override componentDidUpdate() {
		this.props.data.save();
	}

	override render() {
		if (!this.props.data.diceRoller.authToken) {
			return (
				<LoginComponent diceRoller={this.props.data.diceRoller}
					onLogin={this.forceUpdate.bind(this)}/>
			);
		}

		return (<>
			<SetupComponent data={this.props.data}
				onChange={this.clearAttackLists.bind(this)}/>
			<PlayerListComponent partyCard={this.props.data.partyCard}
				onChange={this.forceUpdate.bind(this)}/>
			<RoomSelectComponent data={this.props.data}
				onChange={this.clearAttackLists.bind(this)}/>
			<RoomComponent ref={this.roomComponentRef}
				data={this.props.data}
				onChange={this.forceUpdate.bind(this)}/>
		</>);
	}
}
