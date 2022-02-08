import React, { Component, ChangeEvent } from "react";

import { Monster } from "model/dungeon/monster";
import { Room } from "model/dungeon/room";

interface MonsterListComponentProps {
	room: Room;
	onChange: () => void;
}
interface MonsterListComponentState {}

export class MonsterListComponent extends Component<MonsterListComponentProps, MonsterListComponentState> {

	private monsterTaunted(monster: Monster, event: ChangeEvent<HTMLInputElement>) {
		monster.isTaunted = event.target.checked;
		this.props.onChange();
	}

	override render() {
		return (
			<ul className="monster-list-component">
				{this.props.room.monsters.map((monster) => {
					return (
						<li key={monster.name}
							className={`monster-list-component__monster${monster.isAlive ? "" : " monster-list-component__monster--dead"}`}>

							<span>{`${monster.name}${monster.statusNote ? ` (${monster.statusNote})` : ""}`}</span>
							<label>
								<input type="checkbox"
									checked={monster.isTaunted}
									onChange={this.monsterTaunted.bind(this, monster)}/>

								Taunted
							</label>
							<span>{`${monster.currentDamage} of ${monster.maxHP}`}</span>
						</li>
					);
				})}
			</ul>
		);
	}
}
