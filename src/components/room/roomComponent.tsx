import React, { Component, ReactNode } from "react";

import { DiceRollerControlComponent } from "components/controls/diceRollerControlComponent";
import { InitiativeActionComponent } from "components/room/initiativeActionComponent";
import { ItemsOfInterestComponent } from "components/room/itemsOfInterestComponent";
import { MonsterListComponent } from "components/room/monsterListComponent";
import { PlayerAttackListComponent } from "components/room/playerAttackListComponent";
import { RoomActionComponent } from "components/room/roomActionComponent";
import { StatBlockComponent } from "components/room/statBlockComponent";
import { TimerComponent } from "components/widgets/timerComponent";

import { DataManager } from "model/dataManager";
import { ResetLevel } from "model/attributes/resetLevel";
import { Roll } from "model/diceRoller/roll";
import { roomTimeDuration, nameForInitiativeWinner } from "model/dungeon/room";
import { PlayerAttack } from "model/playerAttack/playerAttack";
import { PlayerAttackType } from "model/playerAttack/playerAttackType";
import { InitiativeAction } from "model/roomAction/initiativeAction";
import { MonsterSaveAttackResult } from "model/roomAction/monsterAttack";
import { RoomAction } from "model/roomAction/roomAction";
import { RoomActionResult } from "model/roomAction/roomActionResult";

const prepTimeRoomCount = 3;

interface RoomComponentProps {
	data: DataManager;
	onChange: () => void;
}
interface RoomComponentState {
	playerAttacks: PlayerAttack[];
	roomActionResult: RoomActionResult | undefined;
	initiativeAction: InitiativeAction | undefined;
}

export class RoomComponent extends Component<RoomComponentProps, RoomComponentState> {
	constructor(props: RoomComponentProps) {
		super(props);

		props.data.diceRoller.rollCallback = this.handlePlayerRoll.bind(this);

		this.state = {
			playerAttacks: [],
			roomActionResult: undefined,
			initiativeAction: undefined
		};
	}

	override componentDidUpdate(prevProps: RoomComponentProps) {
		if (prevProps.data.diceRoller !== this.props.data.diceRoller) {
			prevProps.data.diceRoller.rollCallback = undefined;
			this.props.data.diceRoller.rollCallback = this.handlePlayerRoll.bind(this);
		}
	}

	private handleAllPlayerRolls() {
		this.props.data.diceRoller.rolls.forEach(this.handlePlayerRoll.bind(this));
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

				if (attack.dc) {
					attack.result = (roll.modifiedResult >= attack.dc) ? MonsterSaveAttackResult.success : MonsterSaveAttackResult.failure;
				}
				else {
					attack.result = (roll.success ? MonsterSaveAttackResult.success : MonsterSaveAttackResult.failure);
				}


				this.forceUpdate();
			})
		}

		if (roll.type === "initiative" && this.state.initiativeAction) {
			this.state.initiativeAction.playerRollReceived = true;
			this.state.initiativeAction.playerRoll = roll.dieResult;
			this.state.initiativeAction.playerTotal = roll.modifiedResult;

			this.forceUpdate();
		}
	}

	private roundReset() {
		this.props.data.reset(ResetLevel.round);
		this.clearAttacks();
		this.props.onChange();
	}

	private rollInitiative() {
		this.setState({
			playerAttacks: [],
			roomActionResult: undefined,
			initiativeAction: new InitiativeAction(this.props.data.currentRoom)
		}, this.handleAllPlayerRolls.bind(this));
	}

	clearAttacks() {
		this.setState({
			playerAttacks: [],
			roomActionResult: undefined,
			initiativeAction: undefined
		});
	}

	private completeAllAttacks() {
		this.state.playerAttacks.forEach((attack) => {
			attack.complete();
		});
		this.state.roomActionResult?.complete();

		if (this.state.initiativeAction) {
			this.props.data.currentRoom.initiativeWinner = this.state.initiativeAction.winner;
		}

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
				attack.primaryTarget = this.props.data.currentRoom.defaultTargetForPlayer(player);
				attack.secondaryTarget = attack.primaryTarget;

				return attack;
			}),
			roomActionResult: undefined,
			initiativeAction: undefined
		}, this.handleAllPlayerRolls.bind(this));
	}

	private performRoomAction(action: RoomAction) {
		this.setState({
			playerAttacks: [],
			roomActionResult: action.perform(this.props.data.partyCard),
			initiativeAction: undefined
		}, this.handleAllPlayerRolls.bind(this));
	}

	private renderRoomTimer(): ReactNode {
		if (!this.props.data.startTime) {
			return false;
		}

		const roomStartTime = new Date(
				this.props.data.startTime.getTime() + ((this.props.data.currentRoomPosition + prepTimeRoomCount) * roomTimeDuration)
			);
		const roomEndTime = new Date(roomStartTime.getTime() + roomTimeDuration);

		return (
			<TimerComponent targetDate={roomEndTime}
				countdownStartDate={roomStartTime}
				prefixText="Time until room end:"
				beforeTimeText="Room hasn't started yet"
				afterTimeText="Room is complete"/>
		);
	}

	override render(): ReactNode {
		const hasAttacks = this.state.playerAttacks.length > 0 ||
			this.state.roomActionResult !== undefined ||
			this.state.initiativeAction !== undefined;

		const hasInitiative = this.state.initiativeAction !== undefined;

		const hasMonsters = this.props.data.currentRoom.monsters.length > 0;

		return (
			<div className={`room-component room-${this.props.data.currentRoom.id} row`}>
				<h2 className="room-component__title col">
					{this.props.data.currentRoom.name}
				</h2>
				{hasMonsters && <>
					<div className="room-component__monster-col col">
						<h3>Monsters</h3>
						<MonsterListComponent room={this.props.data.currentRoom}
							onChange={this.props.onChange}/>
					</div>
					<div className="room-component__control-col col">
						<h3>Dice Roller</h3>
						<DiceRollerControlComponent diceRoller={this.props.data.diceRoller}/>
						<h3>Room Actions</h3>
						<div className="room-component__control-row row">
							<button type="button"
								onClick={this.roundReset.bind(this)}>

								Round Reset
							</button>
							{!hasAttacks && <>
								<button type="button"
									onClick={this.rollInitiative.bind(this)}>

									Roll Initiative
								</button>
								<button type="button"
									onClick={this.createPlayerAttacks.bind(this)}>

									Player Attack
								</button>
							</>}
						</div>
						{!hasAttacks &&
							<div className="room-component__control-row row">
								{this.props.data.currentRoom.actions.map((action) => {
									return (
										<button key={action.name}
											type="button"
											onClick={this.performRoomAction.bind(this, action)}>

											{action.name}
										</button>
									);
								})}
							</div>
						}
						{hasAttacks &&
							<div className="room-component__control-row row">
								<button type="button"
									onClick={this.clearAttacks.bind(this)}>

									{`Cancel ${hasInitiative ? "Initiative" : "Attacks"}`}
								</button>
								<button type="button"
									onClick={this.completeAllAttacks.bind(this)}>

									{`Complete ${hasInitiative ? "Initiative" : "Attacks"}`}
								</button>
							</div>
						}
					</div>
				</>}
				<div className="room-component__info-col col">
					<h3>Info</h3>
					{this.renderRoomTimer()}
					{!this.props.data.currentRoom.hideDefaultPushDamage &&
						<div className="room-component__info-line">
							<span>Push Damage:</span>
							<span>{this.props.data.currentRoom.pushDamage}</span>
						</div>
					}
					{this.props.data.currentRoom.initiativeWinner !== undefined &&
						<div className="room-component__info-line">
							<span>Initiative Winner:</span>
							<span>{nameForInitiativeWinner(this.props.data.currentRoom.initiativeWinner)}</span>
						</div>
					}
					{this.props.data.currentRoom.statBlocks.length > 0 &&
						<StatBlockComponent statBlocks={this.props.data.currentRoom.statBlocks}/>
					}
					<ItemsOfInterestComponent tokens={this.props.data.currentRoom.tokensOfInterest}
						spells={this.props.data.currentRoom.spellsOfInterest}/>
					{this.props.data.currentRoom.infoColumnNotes}
				</div>
				{this.props.data.currentRoom.secondaryColumnNotes &&
					<div className="room-component__secondary-info-col col">
						{this.props.data.currentRoom.secondaryColumnNotes}
					</div>
				}
				<div className="room-component__action-col col">
					{this.state.playerAttacks.length > 0 &&
						<PlayerAttackListComponent attacks={this.state.playerAttacks}
							currentRoom={this.props.data.currentRoom}
							attackCompleted={this.completePlayerAttack.bind(this)}/>
					}
					{this.state.roomActionResult !== undefined &&
						<RoomActionComponent result={this.state.roomActionResult}
							partyCard={this.props.data.partyCard}
							currentRoom={this.props.data.currentRoom}
							actionCompleted={this.props.onChange}/>
					}
					{this.state.initiativeAction !== undefined &&
						<InitiativeActionComponent action={this.state.initiativeAction}/>
					}
				</div>
				{this.props.data.currentRoom.mainSectionNotes &&
					<div className="room-component__main-info-col col">
						{this.props.data.currentRoom.mainSectionNotes}
					</div>
				}
			</div>
		);
	}
}
