import React, { Component, ReactNode, ChangeEvent } from "react";

import { DiceRollerControlComponent } from "components/controls/diceRollerControlComponent";
import { ItemsOfInterestComponent } from "components/room/itemsOfInterestComponent";
import { MonsterListComponent } from "components/room/monsterListComponent";
import { StatBlockComponent } from "components/room/statBlockComponent";
import { InitiativeActionComponent } from "components/room/actions/initiativeActionComponent";
import { PlayerAttackListComponent } from "components/room/actions/playerAttackListComponent";
import { RoomActionComponent } from "components/room/actions/roomActionComponent";
import { TimerComponent } from "components/widgets/timerComponent";

import { DataManager } from "model/dataManager";
import { ResetLevel } from "model/attributes/resetLevel";
import { roomTimeDuration, nameForInitiativeWinner } from "model/dungeon/room";
import { RoomAction } from "model/roomAction/roomAction";
import { RoomActionResult } from "model/roomAction/roomActionResult";

const prepTimeRoomCount = 3;

interface RoomComponentProps {
	data: DataManager;
	onChange: () => void;
}
interface RoomComponentState {
	playerAttacks: "playerAttacks" | "quickStrike" | undefined;
	roomActionResult: RoomActionResult | undefined;
	initiativeAction: boolean;
}

export class RoomComponent extends Component<RoomComponentProps, RoomComponentState> {

	constructor(props: RoomComponentProps) {
		super(props);

		this.state = {
			playerAttacks: undefined,
			roomActionResult: undefined,
			initiativeAction: false
		};
	}

	private roundReset() {
		this.props.data.reset(ResetLevel.round);
		this.clearAttacks();
		this.props.onChange();
	}

	private rollInitiative() {
		this.setState({
			playerAttacks: undefined,
			roomActionResult: undefined,
			initiativeAction: true
		});
	}

	clearAttacks() {
		this.setState({
			playerAttacks: undefined,
			roomActionResult: undefined,
			initiativeAction: false
		});
	}

	private createPlayerAttacks(quickStrikeRound: boolean) {
		this.setState({
			playerAttacks: quickStrikeRound ? "quickStrike" : "playerAttacks",
			roomActionResult: undefined,
			initiativeAction: false
		});
	}

	private performRoomAction(action: RoomAction) {
		this.setState({
			playerAttacks: undefined,
			roomActionResult: action.perform(this.props.data.partyCard),
			initiativeAction: false
		});
	}

	private setRogueTreasure(event: ChangeEvent<HTMLInputElement>) {
		this.props.data.currentRoom.rogueTookTreasure = event.target.checked;
		this.props.onChange();
	}

	private renderRoomTimers(): ReactNode {
		if (!this.props.data.startTime) {
			return false;
		}

		const roomStartTime = new Date(
				this.props.data.startTime.getTime() + ((this.props.data.currentRoomPosition + prepTimeRoomCount) * roomTimeDuration)
			);
		const roomEndTime = new Date(roomStartTime.getTime() + roomTimeDuration);

		return <>
			<TimerComponent targetDate={roomEndTime}
				countdownStartDate={roomStartTime}
				prefixText="Time until room end:"
				beforeTimeText="Room hasn't started yet"
				afterTimeText="Room is complete"/>
			{this.props.data.currentRoom.roomTimers.map((timer, index) => {
				return <TimerComponent key={index}
					targetDate={new Date(roomEndTime.getTime() - timer.timeOffset)}
					countdownStartDate={roomStartTime}
					prefixText={timer.label}
					beforeTimeText="Room hasn't started yet"
					afterTimeText={timer.completeText}/>;
			})}
		</>;
	}

	override render(): ReactNode {
		const hasAttacks = this.state.playerAttacks ||
			this.state.roomActionResult !== undefined ||
			this.state.initiativeAction;

		const hasMonsters = this.props.data.currentRoom.monsters.length > 0;

		const infoColumnNotes = this.props.data.currentRoom.infoColumnNotes(this.props.onChange);
		const secondaryColumnNotes = this.props.data.currentRoom.secondaryColumnNotes(this.props.onChange);
		const mainSectionNotes = this.props.data.currentRoom.mainSectionNotes(this.props.onChange);

		return (
			<div className={`room-component room-${this.props.data.currentRoom.id} row`}>
				<h2 className="room-component__title col">
					{this.props.data.currentRoom.name}
				</h2>
				<div className="room-component__info-col col">
					<h3>Info</h3>
					{this.renderRoomTimers()}
					{!this.props.data.currentRoom.hideDefaultPushDamage &&
						<div className="room-component__info-line">
							<span>Push Damage:</span>
							<span>{this.props.data.currentRoom.pushDamage}</span>
						</div>
					}
					{this.props.data.currentRoom.hasRogueTreasure &&
						<div className="room-component__info-line">
							<span>Rogue Took Treasure:</span>
							<input type="checkbox"
								checked={this.props.data.currentRoom.rogueTookTreasure}
								onChange={this.setRogueTreasure.bind(this)}/>
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
					{infoColumnNotes}
				</div>
				{hasMonsters && <>
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
									onClick={this.createPlayerAttacks.bind(this, false)}>

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
					</div>
					<div className="room-component__monster-col col">
						<h3>Monsters</h3>
						<MonsterListComponent room={this.props.data.currentRoom}
							onChange={this.props.onChange}/>
					</div>
				</>}
				{secondaryColumnNotes &&
					<div className="room-component__secondary-info-col col">
						{secondaryColumnNotes}
					</div>
				}
				<div className="room-component__action-col col">
					{this.state.playerAttacks !== undefined &&
						<PlayerAttackListComponent data={this.props.data}
							clearAction={this.clearAttacks.bind(this)}
							onChange={this.props.onChange}
							isQuickStrike={this.state.playerAttacks === "quickStrike"}/>
					}
					{this.state.roomActionResult !== undefined &&
						<RoomActionComponent result={this.state.roomActionResult}
							diceRoller={this.props.data.diceRoller}
							clearAction={this.clearAttacks.bind(this)}
							onChange={this.props.onChange}/>
					}
					{this.state.initiativeAction &&
						<InitiativeActionComponent data={this.props.data}
							clearAction={this.clearAttacks.bind(this)}
							onChange={this.props.onChange}
							triggerQuickStrike={this.createPlayerAttacks.bind(this, true)}/>
					}
				</div>
				{mainSectionNotes &&
					<div className="room-component__main-info-col col">
						{mainSectionNotes}
					</div>
				}
			</div>
		);
	}
}
