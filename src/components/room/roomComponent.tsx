import React, { Component, ReactNode, RefObject } from "react";

import { MonsterListComponent } from "components/monsterList/monsterListComponent";
import { PlayerAttackListComponent } from "components/room/playerAttackListComponent";
import { RoomActionComponent } from "components/room/roomActionComponent";

import { DataManager } from "model/dataManager";

interface RoomComponentProps {
	data: DataManager;
	onChange: () => void;
}
interface RoomComponentState {}

export class RoomComponent extends Component<RoomComponentProps, RoomComponentState> {
	private playerAttackListRef: RefObject<PlayerAttackListComponent>;
	private roomActionRef: RefObject<RoomActionComponent>;

	constructor(props: RoomComponentProps) {
		super(props);

		this.playerAttackListRef = React.createRef();
		this.roomActionRef = React.createRef();
	}

	clearAttacks() {
		this.playerAttackListRef.current?.clearAttacks();
		this.roomActionRef.current?.clearResults();
	}

	override render(): ReactNode {
		return (<>
			<MonsterListComponent room={this.props.data.currentRoom}
				onChange={this.props.onChange}/>
			<PlayerAttackListComponent ref={this.playerAttackListRef}
				partyCard={this.props.data.partyCard}
				currentRoom={this.props.data.currentRoom}
				attackCompleted={this.props.onChange}/>
			<RoomActionComponent ref={this.roomActionRef}
				partyCard={this.props.data.partyCard}
				currentRoom={this.props.data.currentRoom}
				actionCompleted={this.props.onChange}/>
		</>);
	}
}
