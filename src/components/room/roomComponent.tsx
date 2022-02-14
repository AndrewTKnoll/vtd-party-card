import React, { Component, ReactNode } from "react";

import { MonsterListComponent } from "components/monsterList/monsterListComponent";
import { PlayerAttackListComponent } from "components/room/playerAttackListComponent";
import { RoomActionComponent } from "components/room/roomActionComponent";

import { DataManager } from "model/dataManager";
import { Roll } from "model/diceRoller/roll";
import { PlayerAttack } from "model/playerAttack/playerAttack";
import { PlayerAttackType } from "model/playerAttack/playerAttackType";
import { MonsterSaveAttackResult } from "model/roomAction/monsterAttack";
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

		props.data.diceRoller.rollCallback = this.handlePlayerRoll.bind(this);

		this.state = {
			playerAttacks: [],
			roomActionResult: undefined
		};
	}

	override componentDidUpdate(prevProps: RoomComponentProps) {
		if (prevProps.data.diceRoller !== this.props.data.diceRoller) {
			prevProps.data.diceRoller.rollCallback = undefined;
			this.props.data.diceRoller.rollCallback = this.handlePlayerRoll.bind(this);
		}
	}

	private handlePlayerRoll(roll: Roll) {
		if (roll.type === "attack") {
			this.state.playerAttacks.forEach((attack) => {
				if (roll.class !== attack.player.class) {
					return;
				}

				switch (roll.attackType) {
					case "melee_main":
						attack.attackType = PlayerAttackType.melee;
						attack.primaryDamageAmount = roll.success ? roll.damage : 0;
						attack.primaryCritMultiplier = roll.dieResult === 20 ? 2 : 1;
						break;
					case "melee_off":
						attack.attackType = PlayerAttackType.melee;
						attack.secondaryDamageAmount = roll.success ? roll.damage : 0;
						attack.secondaryCritMultiplier = roll.dieResult === 20 ? 2 : 1;
						break;
					case "ranged_main":
						attack.attackType = PlayerAttackType.ranged;
						attack.primaryDamageAmount = roll.success ? roll.damage : 0;
						attack.primaryCritMultiplier = roll.dieResult === 20 ? 2 : 1;
						break;
					case "ranged_off":
						attack.attackType = PlayerAttackType.ranged;
						attack.secondaryDamageAmount = roll.success ? roll.damage : 0;
						attack.secondaryCritMultiplier = roll.dieResult === 20 ? 2 : 1;
						break;
					case "spell":
						attack.attackType = PlayerAttackType.spell;
						attack.primaryDamageAmount = roll.success ? roll.damage : 0;
						break;
				}

				this.forceUpdate();
			});
		}

		if (roll.type === "save") {
			this.state.roomActionResult?.attacks.forEach((attack) => {
				if (
					attack.type !== "save" ||
					attack.save !== roll.saveType ||
					roll.class !== attack.target.class
				) {
					return;
				}

				attack.result = (roll.success ? MonsterSaveAttackResult.success : MonsterSaveAttackResult.failure);

				this.forceUpdate();
			})
		}
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
		}, () => {
			this.props.data.diceRoller.rolls.forEach((roll) => {
				this.handlePlayerRoll(roll);
			});
		});
	}

	private performRoomAction(action: RoomAction) {
		this.setState({
			playerAttacks: [],
			roomActionResult: action.perform(this.props.data.partyCard)
		}, () => {
			this.props.data.diceRoller.rolls.forEach((roll) => {
				this.handlePlayerRoll(roll);
			});
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
