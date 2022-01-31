import React, { Component, ChangeEvent } from "react";

import { Dungeon } from "model/dungeon/dungeon";

interface RoomControlComponentProps {
	dungeon: Dungeon
	onChange: () => void;
}
interface RoomControlComponentState {}

export class RoomControlComponent extends Component<RoomControlComponentProps, RoomControlComponentState> {

	private newRoomSelected(event: ChangeEvent<HTMLSelectElement>) {
		this.props.dungeon.currentRoom = Number.parseInt(event.target.value);
		this.props.onChange();
	}

	override render() {
		return (
			<select value={this.props.dungeon.currentRoom}
				onChange={this.newRoomSelected.bind(this)}>

				{this.props.dungeon.rooms.map((room, index) => {
					return (
						<option key={room.id}
							value={index}>

							{room.name}
						</option>
					);
				})}
			</select>
		);
	}
}
