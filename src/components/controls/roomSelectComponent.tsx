import React, { Component, ReactNode } from "react";

import { ResetLevel } from "model/attributes/resetLevel";
import { DataManager } from "model/dataManager";
import { Room } from "model/dungeon/room";

interface RoomSelectComponentProps {
	data: DataManager;
	onChange: () => void;
}

export class RoomSelectComponent extends Component<RoomSelectComponentProps> {

	private newRoomSelected(room: Room) {
		if (this.props.data.currentRoom !== room) {
			this.props.data.currentRoom = room;
			this.props.data.reset(ResetLevel.room);
		}

		this.props.onChange();
	}

	private renderOption(option: Room, positionIndex: number, optionIndex: number): ReactNode {
		return <button key={optionIndex}
			type="button"
			disabled={option === this.props.data.currentRoom}
			onClick={this.newRoomSelected.bind(this, option)}>

			{option.idIsStandalone ? option.id : `Room ${option.id}`}
		</button>;
	}

	private renderPosition(position: Room[], positionIndex: number): ReactNode {
		return <li key={positionIndex}
			className="col">

			{position.map((option, optionIndex) => {
				return this.renderOption(option, positionIndex, optionIndex);
			})}
		</li>;
	}

	override render(): ReactNode {
		return <ul className="room-select-component row">
			{this.props.data.dungeon.rooms.map((position, positionIndex) => {
				return this.renderPosition(position, positionIndex);
			})}
		</ul>;
	}
}
