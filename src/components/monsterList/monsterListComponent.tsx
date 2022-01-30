import React, { Component } from "react";

import { Room } from "model/dungeon/room";

interface MonsterListComponentProps {
	room: Room;
}
interface MonsterListComponentState {}

export class MonsterListComponent extends Component<MonsterListComponentProps, MonsterListComponentState> {

	override render() {
		return (
			<ul className="monster-list-component">
				{this.props.room.monsters.map((monster) => {
					return (
						<li key={monster.name}
							className={`monster-list-component__monster${monster.isAlive ? "" : " monster-list-component__monster--dead"}`}>

							<span>{`${monster.name}${monster.statusNote ? ` (${monster.statusNote})` : ""}`}</span>
							<span>{`${monster.currentDamage} of ${monster.maxHP}`}</span>
						</li>
					);
				})}
			</ul>
		);
	}
}
