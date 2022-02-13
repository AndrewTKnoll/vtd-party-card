import React, { Component, RefObject } from "react";

import { LoginComponent } from "components/loginComponent";
import { RoomSelectComponent } from "components/controls/roomSelectComponent";
import { MonsterListComponent } from "components/monsterList/monsterListComponent";
import { PlayerListComponent } from "components/playerList/playerListComponent";
import { PlayerAttackListComponent } from "components/room/playerAttackListComponent";
import { RoomActionComponent } from "components/room/roomActionComponent";
import { SetupComponent } from "components/setup/setupComponent";

import { DataManager } from "model/dataManager";

interface VDMAssistantComponentProps {
	data: DataManager;
}
interface VDMAssistantComponentState {}

export class VDMAssistantComponent extends Component<VDMAssistantComponentProps, VDMAssistantComponentState> {
	private playerAttackListRef: RefObject<PlayerAttackListComponent>;
	private roomActionRef: RefObject<RoomActionComponent>;

	constructor(props: VDMAssistantComponentProps) {
		super(props);

		this.playerAttackListRef = React.createRef();
		this.roomActionRef = React.createRef();
	}

	private clearAttackLists() {
		this.playerAttackListRef.current?.clearAttacks();
		this.roomActionRef.current?.clearResults();
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
			<MonsterListComponent room={this.props.data.currentRoom}
				onChange={this.forceUpdate.bind(this)}/>
			<PlayerAttackListComponent ref={this.playerAttackListRef}
				partyCard={this.props.data.partyCard}
				currentRoom={this.props.data.currentRoom}
				attackCompleted={this.forceUpdate.bind(this)}/>
			<RoomActionComponent ref={this.roomActionRef}
				partyCard={this.props.data.partyCard}
				currentRoom={this.props.data.currentRoom}
				actionCompleted={this.forceUpdate.bind(this)}/>
		</>);
	}
}
