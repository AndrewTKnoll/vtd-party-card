import React, { Component, ReactNode } from "react";

import { ResetLevel } from "model/attributes/resetLevel";
import { DataManager } from "model/dataManager";
import { Room } from "model/dungeon/room";

interface RoomSelectComponentProps {
	data: DataManager;
	onChange: () => void;
}
interface RoomSelectComponentState {}

export class RoomSelectComponent extends Component<RoomSelectComponentProps, RoomSelectComponentState> {

	private goToEpilogue() {
		this.props.data.inEpilogue = true;
		this.props.onChange();
	}

	private newRoomSelected(room: Room) {
		this.props.data.inEpilogue = false;

		if (this.props.data.currentRoom !== room) {
			this.props.data.currentRoom = room;
			this.props.data.reset(ResetLevel.room);
		}

		this.props.onChange();
	}

	private renderOption(option: Room, positionIndex: number, optionIndex: number): ReactNode {
		return (
			<button key={optionIndex}
				type="button"
				disabled={option === this.props.data.currentRoom && !this.props.data.inEpilogue}
				onClick={this.newRoomSelected.bind(this, option)}>

				{`Room ${option.id}`}
			</button>
		);
	}

	private renderPosition(position: Room[], positionIndex: number): ReactNode {
		return (
			<li key={positionIndex}
				className="col">

				{position.map((option, optionIndex) => {
					return this.renderOption(option, positionIndex, optionIndex);
				})}
			</li>
		);
	}

	override render(): ReactNode {
		return (
			<ul className="room-select-component row">
				{this.props.data.dungeon.rooms.map((position, positionIndex) => {
					return this.renderPosition(position, positionIndex);
				})}
				<li className="col">
					<button type="button"
						disabled={this.props.data.inEpilogue}
						onClick={this.goToEpilogue.bind(this)}>

						Epilogue
					</button>
				</li>
			</ul>
		);
	}
}
