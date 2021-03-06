import React, { Component, ReactNode, ChangeEvent } from "react";

import { ContextData, injectContext } from "components/globalContext";
import { DiceRollerControlComponent } from "components/diceRoller/diceRollerControlComponent";
import { ItemsOfInterestComponent } from "components/room/itemsOfInterestComponent";
import { MonsterListComponent } from "components/room/monsterListComponent";
import { StatBlockComponent } from "components/room/statBlockComponent";
import { DeathDieComponent } from "components/room/actions/deathDieComponent";
import { DivineInterventionComponent } from "components/room/actions/divineInterventionComponent";
import { InitiativeActionComponent } from "components/room/actions/initiativeActionComponent";
import { PlayerAttackListComponent } from "components/room/actions/playerAttackListComponent";
import { RoomActionComponent } from "components/room/actions/roomActionComponent";
import { CollapseComponent } from "components/structure/collapseComponent";
import { TimerComponent } from "components/widgets/timerComponent";

import { ResetLevel } from "model/attributes/resetLevel";
import { Room, roomTimeDuration, nameForInitiativeWinner } from "model/dungeon/room";
import { Class } from "model/partyCard/class";
import { RoomAction } from "model/roomAction/roomAction";
import { RoomActionResult } from "model/roomAction/roomActionResult";

const prepTimeRoomOffsetCount = 2;

type ActionType = "playerAttacks" | "quickStrike" | "initiative" | "divineIntervention" | "deathDie" | RoomActionResult;

type RoomComponentProps = ContextData & {
	currentRoom: Room; // keeping a direct reference to detect room changes
}
interface RoomComponentState {
	currentAction: ActionType | undefined;
}

export const RoomComponent = injectContext(class extends Component<RoomComponentProps, RoomComponentState> {

	constructor(props: RoomComponentProps) {
		super(props);

		this.state = {
			currentAction: undefined
		};
	}

	override componentDidUpdate(prevProps: RoomComponentProps) {
		if (prevProps.currentRoom !== this.props.currentRoom) {
			this.setAction(undefined);
		}
	}

	private roundReset() {
		this.props.data.reset(ResetLevel.round);
		this.setAction(undefined);
		this.props.onChange();
	}

	private setAction(action: ActionType | undefined) {
		this.setState({
			currentAction: action
		});
	}

	private performRoomAction(action: RoomAction) {
		this.setAction(action.perform(this.props.data.partyCard));
	}

	private setRogueTreasure(event: ChangeEvent<HTMLInputElement>) {
		this.props.currentRoom.rogueTookTreasure = event.target.checked;
		this.props.onChange();
	}

	private renderRoomTimers(): ReactNode {
		if (!this.props.data.startTime) {
			return false;
		}

		const roomStartTime = new Date(
			this.props.data.startTime.getTime() + ((this.props.data.currentRoomPosition + prepTimeRoomOffsetCount) * roomTimeDuration)
		);
		const roomEndTime = new Date(roomStartTime.getTime() + roomTimeDuration);

		return <>
			{!this.props.currentRoom.hideRoomTimer &&
				<TimerComponent targetDate={roomEndTime}
					countdownStartDate={roomStartTime}
					prefixText="Time until room end:"
					beforeTimeText="Room hasn't started yet"
					afterTimeText="Room is complete"/>
			}
			{this.props.currentRoom.roomTimers.map((timer, index) => {
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
		const secondaryColumnNotes = this.props.currentRoom.secondaryColumnNotes(this.props.onChange);
		const mainSectionNotes = this.props.currentRoom.mainSectionNotes(this.props.onChange);

		return <div className={`room-component room-${this.props.currentRoom.id.toLowerCase()} row`}>
			<h2 className="room-component__title col">
				{this.props.currentRoom.name}
			</h2>
			{this.props.currentRoom.hasInfoColumn &&
				<div className="room-component__info-col col">
					<h3>Info</h3>
					{this.renderRoomTimers()}
					{!this.props.currentRoom.hideDefaultPushDamage &&
						<div className="room-component__info-line">
							<span>Push damage:</span>
							<span>{this.props.currentRoom.pushDamage}</span>
						</div>
					}
					{this.props.currentRoom.hasRogueTreasure && this.props.data.partyCard.player(Class.rogue).isPresent &&
						<div className="room-component__info-line">
							<span>Rogue took treasure:</span>
							<input type="checkbox"
								checked={this.props.currentRoom.rogueTookTreasure}
								onChange={this.setRogueTreasure.bind(this)}/>
						</div>
					}
					{this.props.currentRoom.initiativeWinner !== undefined &&
						<div className="room-component__info-line">
							<span>Initiative winner:</span>
							<span>{nameForInitiativeWinner(this.props.currentRoom.initiativeWinner)}</span>
						</div>
					}
					{this.props.currentRoom.statBlocks.length > 0 &&
						<StatBlockComponent statBlocks={this.props.currentRoom.statBlocks}/>
					}
					<ItemsOfInterestComponent tokens={this.props.currentRoom.tokensOfInterest}
						spells={this.props.currentRoom.spellsOfInterest}/>
					{this.props.currentRoom.infoColumnNotes(this.props.onChange)}
				</div>
			}
			{this.props.currentRoom.monsters.length > 0 && <>
				<div className="room-component__control-col col">
					<CollapseComponent headerText="Dice Roller"
						headerLevel="h3">

						<DiceRollerControlComponent diceRoller={this.props.data.diceRoller}/>
					</CollapseComponent>
					<h3>Room Actions</h3>
					<div className="room-component__control-row row">
						<button type="button"
							onClick={this.roundReset.bind(this)}>

							Round Reset
						</button>
						{this.state.currentAction === undefined &&
							<button type="button"
								onClick={this.setAction.bind(this, "playerAttacks")}>

								Player Attack
							</button>
						}
					</div>
					{this.state.currentAction === undefined && <>
						<div className="room-component__control-row row">
							<button type="button"
								onClick={this.setAction.bind(this, "initiative")}>

								Initiative
							</button>
							<button type="button"
								onClick={this.setAction.bind(this, "divineIntervention")}>

								Divine Intervention
							</button>
							<button type="button"
								onClick={this.setAction.bind(this, "deathDie")}>

								Death Die
							</button>
						</div>
						<div className="room-component__control-row row">
							{this.props.currentRoom.actions.map((action) => {
								return <button key={action.name}
									type="button"
									onClick={this.performRoomAction.bind(this, action)}>

									{action.name}
								</button>;
							})}
						</div>
					</>}
				</div>
				<div className="room-component__monster-col col">
					<h3>Monsters</h3>
					<MonsterListComponent/>
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
						<PlayerAttackListComponent clearAction={this.setAction.bind(this, undefined)}
							isQuickStrike={this.state.currentAction === "quickStrike"}/>
					}
					{this.state.currentAction instanceof RoomActionResult &&
						<RoomActionComponent clearAction={this.setAction.bind(this, undefined)}
							result={this.state.currentAction}/>
					}
					{this.state.currentAction === "initiative" &&
						<InitiativeActionComponent clearAction={this.setAction.bind(this, undefined)}
							triggerQuickStrike={this.setAction.bind(this, "quickStrike")}/>
					}
					{this.state.currentAction === "divineIntervention" &&
						<DivineInterventionComponent clearAction={this.setAction.bind(this, undefined)}/>
					}
					{this.state.currentAction === "deathDie" &&
						<DeathDieComponent clearAction={this.setAction.bind(this, undefined)}/>
					}
				</div>
			}
			{mainSectionNotes &&
				<div className="room-component__main-info-col col">
					{mainSectionNotes}
				</div>
			}
		</div>;
	}
});
