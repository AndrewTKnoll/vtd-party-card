import React, { Component, ReactNode, RefObject } from "react";

import { MonsterListComponent } from "components/monsterList/monsterListComponent";
import { PlayerAttackListComponent } from "components/room/playerAttackListComponent";
import { RoomActionComponent } from "components/room/roomActionComponent";

import { DataManager } from "model/dataManager";
import { PlayerAttack } from "model/playerAttack/playerAttack";

interface RoomComponentProps {
	data: DataManager;
	onChange: () => void;
}
interface RoomComponentState {
	playerAttacks: PlayerAttack[];
}

export class RoomComponent extends Component<RoomComponentProps, RoomComponentState> {
	private roomActionRef: RefObject<RoomActionComponent>;

	constructor(props: RoomComponentProps) {
		super(props);

		this.state = {
			playerAttacks: []
		};

		this.roomActionRef = React.createRef();
	}

	clearAttacks() {
		this.setState({
			playerAttacks: []
		});
		this.roomActionRef.current?.clearResults();
	}

	private completeAllAttacks() {
		this.state.playerAttacks.forEach((attack) => {
			attack.complete();
		});
		this.clearAttacks();
		this.props.onChange();
	}

	private completePlayerAttack(completeAttack: PlayerAttack) {
		completeAttack.complete();
		this.setState({
			playerAttacks: this.state.playerAttacks.filter((attack) => {
				return completeAttack !== attack;
			})
		});
	}

	private createPlayerAttacks() {
		this.setState({
			playerAttacks: this.props.data.partyCard.activePlayers.map((player) => {
				const attack = new PlayerAttack(player, this.props.data.currentRoom);
				attack.primaryTarget = this.props.data.currentRoom.monsters[0];
				attack.secondaryTarget = this.props.data.currentRoom.monsters[0];

				return attack;
			})
		});
	}

	override render(): ReactNode {
		return (<>
			<MonsterListComponent room={this.props.data.currentRoom}
				onChange={this.props.onChange}/>
			<button type="button"
				disabled={this.state.playerAttacks.length > 0}
				onClick={this.createPlayerAttacks.bind(this)}>

				Player Attack
			</button>
			<button type="button"
				disabled={this.state.playerAttacks.length === 0}
				onClick={this.clearAttacks.bind(this)}>

				Clear Attacks
			</button>
			<button type="button"
				disabled={this.state.playerAttacks.length === 0}
				onClick={this.completeAllAttacks.bind(this)}>

				Complete Attacks
			</button>
			<PlayerAttackListComponent attacks={this.state.playerAttacks}
				currentRoom={this.props.data.currentRoom}
				attackCompleted={this.completePlayerAttack.bind(this)}/>
			<RoomActionComponent ref={this.roomActionRef}
				partyCard={this.props.data.partyCard}
				currentRoom={this.props.data.currentRoom}
				actionCompleted={this.props.onChange}/>
		</>);
	}
}
