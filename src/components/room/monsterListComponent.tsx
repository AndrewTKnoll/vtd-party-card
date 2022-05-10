import React, { Component, ChangeEvent, ReactNode } from "react";

import { ContextData, injectContext } from "components/globalContext";
import { ModalComponent } from "components/structure/modalComponent";

import { Monster } from "model/dungeon/monster";

export const MonsterListComponent = injectContext(class extends Component<ContextData> {

	private monsterHPAdjusted(monster: Monster, event: ChangeEvent<HTMLInputElement>) {
		monster.currentDamage = event.target.valueAsNumber;
		this.props.onChange();
	}

	private monsterTaunted(monster: Monster, event: ChangeEvent<HTMLInputElement>) {
		monster.isTaunted = event.target.checked;
		this.props.onChange();
	}

	override render(): ReactNode {
		return <div className="monster-list-component">
			<ul>
				{this.props.data.currentRoom.monsters.map((monster) => {
					return <li key={monster.name}
						className={`monster-list-component__monster${monster.isAlive ? "" : " monster-list-component__monster--dead"} row`}>

						<span className="monster-list-component__name col">
							{`${monster.name}${monster.statusNote ? ` (${monster.statusNote})` : ""}`}
						</span>
						{monster.isTauntable &&
							<label className="monster-list-component__taunt col">
								<input type="checkbox"
									checked={monster.isTaunted}
									onChange={this.monsterTaunted.bind(this, monster)}/>

								Taunted
							</label>
						}
						<span className="monster-list-component__health col">
							{`${monster.currentDamage} of ${monster.maxHP}`}
						</span>
					</li>;
				})}
			</ul>
			<ModalComponent title="Adjust Monster HP"
				titleHeaderLevel="h4"
				openButtonText="Adjust">

				<ul>
					{this.props.data.currentRoom.monsters.map((monster) => {
						return <li key={monster.name}
							className="monster-list-component__adjust-monster row">

							<span className="monster-list-component__adjust-name col">
								{monster.name}
							</span>
							<div className="monster-list-component__adjust-health col">
								<input type="number"
									value={monster.currentDamage}
									onChange={this.monsterHPAdjusted.bind(this, monster)}/>
								{` of ${monster.maxHP}`}
							</div>
						</li>;
					})}
				</ul>
			</ModalComponent>
		</div>;
	}
});
