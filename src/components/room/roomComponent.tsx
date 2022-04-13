import React, { Component, ReactNode, ChangeEvent } from "react";

import { DiceRollerControlComponent } from "components/controls/diceRollerControlComponent";
import { ItemsOfInterestComponent } from "components/room/itemsOfInterestComponent";
import { MonsterListComponent } from "components/room/monsterListComponent";
import { StatBlockComponent } from "components/room/statBlockComponent";
import { DivineInterventionComponent } from "components/room/actions/divineInterventionComponent";
import { InitiativeActionComponent } from "components/room/actions/initiativeActionComponent";
import { PlayerAttackListComponent } from "components/room/actions/playerAttackListComponent";
import { RoomActionComponent } from "components/room/actions/roomActionComponent";
import { CollapseComponent } from "components/structure/collapseComponent";
import { TimerComponent } from "components/widgets/timerComponent";

import { DataManager } from "model/dataManager";
import { ResetLevel } from "model/attributes/resetLevel";
import { roomTimeDuration, nameForInitiativeWinner } from "model/dungeon/room";
import { RoomAction } from "model/roomAction/roomAction";
import { RoomActionResult } from "model/roomAction/roomActionResult";

const prepTimeRoomCount = 3;

type ActionType = "playerAttacks" | "quickStrike" | "initiative" | "divineIntervention" | RoomActionResult;

interface RoomComponentProps {
	data: DataManager;
	onChange: () => void;
}
interface RoomComponentState {
	currentAction: ActionType | undefined;
}

export class RoomComponent extends Component<RoomComponentProps, RoomComponentState> {

	constructor(props: RoomComponentProps) {
		super(props);

		this.state = {
			currentAction: undefined
		};
	}

	private roundReset() {
		this.props.data.reset(ResetLevel.round);
		this.setAction(undefined);
		this.props.onChange();
	}

	setAction(action: ActionType | undefined) {
		this.setState({
			currentAction: action
		});
	}

	private performRoomAction(action: RoomAction) {
		this.setAction(action.perform(this.props.data.partyCard));
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
					{this.props.data.currentRoom.infoColumnNotes(this.props.onChange)}
				</div>
				{this.props.data.currentRoom.monsters.length > 0 && <>
					<div className="room-component__control-col col">
						<h3>Dice Roller</h3>
						<DiceRollerControlComponent diceRoller={this.props.data.diceRoller}/>
						<CollapseComponent headerText="Special Actions"
							headerLevel="h3"
							contentClass="room-component__control-row row">

							<button type="button"
								onClick={this.setAction.bind(this, "divineIntervention")}>

								Divine Intervention
							</button>
						</CollapseComponent>
						<h3>Room Actions</h3>
						<div className="room-component__control-row row">
							<button type="button"
								onClick={this.roundReset.bind(this)}>

								Round Reset
							</button>
							{this.state.currentAction === undefined && <>
								<button type="button"
									onClick={this.setAction.bind(this, "initiative")}>

									Roll Initiative
								</button>
								<button type="button"
									onClick={this.setAction.bind(this, "playerAttacks")}>

									Player Attack
								</button>
							</>}
						</div>
						{this.state.currentAction === undefined &&
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
				{this.state.currentAction !== undefined &&
					<div className="room-component__action-col col">
						{(this.state.currentAction === "playerAttacks" || this.state.currentAction === "quickStrike") &&
							<PlayerAttackListComponent data={this.props.data}
								clearAction={this.setAction.bind(this, undefined)}
								onChange={this.props.onChange}
								isQuickStrike={this.state.currentAction === "quickStrike"}/>
						}
						{this.state.currentAction instanceof RoomActionResult &&
							<RoomActionComponent result={this.state.currentAction}
								diceRoller={this.props.data.diceRoller}
								clearAction={this.setAction.bind(this, undefined)}
								onChange={this.props.onChange}/>
						}
						{this.state.currentAction === "initiative" &&
							<InitiativeActionComponent data={this.props.data}
								clearAction={this.setAction.bind(this, undefined)}
								onChange={this.props.onChange}
								triggerQuickStrike={this.setAction.bind(this, "quickStrike")}/>
						}
						{this.state.currentAction === "divineIntervention" &&
							<DivineInterventionComponent data={this.props.data}
								clearAction={this.setAction.bind(this, undefined)}
								onChange={this.props.onChange}/>
						}
					</div>
				}
				{mainSectionNotes &&
					<div className="room-component__main-info-col col">
						{mainSectionNotes}
					</div>
				}
			</div>
		);
	}
}
