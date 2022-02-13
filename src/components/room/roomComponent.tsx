import React, { Component, ReactNode } from "react";

import { MonsterListComponent } from "components/monsterList/monsterListComponent";
import { PlayerAttackListComponent } from "components/room/playerAttackListComponent";
import { RoomActionComponent } from "components/room/roomActionComponent";

import { DataManager } from "model/dataManager";
import { PlayerAttack } from "model/playerAttack/playerAttack";
import { RoomAction } from "model/roomAction/roomAction";
import { RoomActionResult } from "model/roomAction/roomActionResult";

interface RoomComponentProps {
	data: DataManager;
	onChange: () => void;
}
interface RoomComponentState {
	playerAttacks: PlayerAttack[];
	roomActionResult: RoomActionResult | undefined;
}

export class RoomComponent extends Component<RoomComponentProps, RoomComponentState> {
	constructor(props: RoomComponentProps) {
		super(props);

		this.state = {
			playerAttacks: [],
			roomActionResult: undefined
		};
	}

	clearAttacks() {
		this.setState({
			playerAttacks: [],
			roomActionResult: undefined
		});
	}

	private completeAllAttacks() {
		this.state.playerAttacks.forEach((attack) => {
			attack.complete();
		});
		this.state.roomActionResult?.complete();
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
			}),
			roomActionResult: undefined
		});
	}

	private performRoomAction(action: RoomAction) {
		this.setState({
			playerAttacks: [],
			roomActionResult: action.perform(this.props.data.partyCard)
		});
	}

	override render(): ReactNode {
		const hasAttacks = this.state.playerAttacks.length > 0 || this.state.roomActionResult !== undefined;

		return (<>
			<MonsterListComponent room={this.props.data.currentRoom}
				onChange={this.props.onChange}/>
			<button type="button"
				disabled={hasAttacks}
				onClick={this.createPlayerAttacks.bind(this)}>

				Player Attack
			</button>
			<button type="button"
				disabled={!hasAttacks}
				onClick={this.clearAttacks.bind(this)}>

				Clear Attacks
			</button>
			<button type="button"
				disabled={!hasAttacks}
				onClick={this.completeAllAttacks.bind(this)}>

				Complete Attacks
			</button>
			{this.props.data.currentRoom.actions.map((action) => {
				return (
					<button key={action.name}
						type="button"
						disabled={hasAttacks}
						onClick={this.performRoomAction.bind(this, action)}>

						{action.name}
					</button>
				);
			})}
			<PlayerAttackListComponent attacks={this.state.playerAttacks}
				currentRoom={this.props.data.currentRoom}
				attackCompleted={this.completePlayerAttack.bind(this)}/>
			<RoomActionComponent result={this.state.roomActionResult}
				partyCard={this.props.data.partyCard}
				currentRoom={this.props.data.currentRoom}
				actionCompleted={this.props.onChange}/>
		</>);
	}
}
