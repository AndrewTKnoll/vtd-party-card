import React, { Component, RefObject } from "react";

import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";

import { MonsterListComponent } from "components/monsterList/monsterListComponent";
import { PlayerListComponent } from "components/playerList/playerListComponent";
import { PlayerAttackListComponent } from "components/room/playerAttackListComponent";
import { RoomActionComponent } from "components/room/roomActionComponent";

import { ResetLevel } from "model/attributes/resetLevel";
import { Room } from "model/dungeon/room";

import { Difficulty, allDifficulties, nameForDifficulty } from "model/attributes/difficulty";

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

	private setDifficulty(newDifficulty: Difficulty) {
		this.props.data.dungeon.difficulty = newDifficulty;
		this.forceUpdate();
	}

	private setCurrentRoom(newRoom: Room) {
		this.props.data.dungeon.currentRoom = newRoom;

		this.playerAttackListRef.current?.clearAttacks();
		this.roomActionRef.current?.clearResults();
		this.forceUpdate();
	}

	private fullReset() {
		if (confirm("Confirm Reset")) {
			this.props.data.reset(ResetLevel.full);

			this.playerAttackListRef.current?.clearAttacks();
			this.roomActionRef.current?.clearResults();
			this.forceUpdate();
		}
	}

	override componentDidUpdate() {
		this.props.data.save();
	}

	override render() {
		return (<>
			<PlayerListComponent partyCard={this.props.data.partyCard}
				onPlayerChange={this.forceUpdate.bind(this)}/>
			<button type="button"
				onClick={this.fullReset.bind(this)}>

				Full Reset
			</button>
			<ItemListSelectComponent isOptional={false}
				items={allDifficulties}
				labelForItem={nameForDifficulty}
				selectedItem={this.props.data.dungeon.difficulty}
				onChange={this.setDifficulty.bind(this)}/>
			<ItemListSelectComponent isOptional={false}
				items={this.props.data.dungeon.rooms}
				labelForItem={(room) => { return room.name; }}
				selectedItem={this.props.data.dungeon.currentRoom}
				onChange={this.setCurrentRoom.bind(this)}/>
			<MonsterListComponent room={this.props.data.dungeon.currentRoom}/>
			<PlayerAttackListComponent ref={this.playerAttackListRef}
				partyCard={this.props.data.partyCard}
				currentRoom={this.props.data.dungeon.currentRoom}
				attackCompleted={this.forceUpdate.bind(this)}/>
			<RoomActionComponent ref={this.roomActionRef}
				partyCard={this.props.data.partyCard}
				currentRoom={this.props.data.dungeon.currentRoom}
				actionCompleted={this.forceUpdate.bind(this)}/>
		</>);
	}
}
