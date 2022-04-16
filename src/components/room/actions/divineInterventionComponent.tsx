import React, { Component, ReactNode } from "react";

import { RollCallbackComponent } from "components/diceRoller/rollCallbackComponent";
import { RoomActionButtonListComponent } from "components/room/roomActionButtonListComponent";

import { DataManager } from "model/dataManager";
import { DamageType } from "model/attributes/damageType";
import { Roll } from "model/diceRoller/roll";
import { Class } from "model/partyCard/class";
import { PlayerAttackType } from "model/playerAttack/playerAttackType";

interface DivineInterventionComponentProps {
	data: DataManager;
	clearAction: () => void;
	onChange: () => void;
}
interface DivineInterventionComponentState {
	playerRoll: number | undefined;
}

export class DivineInterventionComponent extends Component<DivineInterventionComponentProps, DivineInterventionComponentState> {

	/* lifecycle */

	constructor(props: DivineInterventionComponentProps) {
		super(props);

		this.state = {
			playerRoll: undefined
		};
	}

	/* events */

	private handlePlayerRoll(roll: Roll) {
		if (roll.type !== "initiative") {
			return;
		}

		this.setState({
			playerRoll: roll.dieResult
		});
	}

	private completeDivineIntervention() {
		if (this.state.playerRoll === 20) {
			this.props.data.currentRoom.monsters.forEach((monster) => {
				monster.takeDamage({
					type: PlayerAttackType.spell,
					player: this.props.data.partyCard.player(Class.cleric),
					amount: 100,
					multiplier: 1,
					damageType: DamageType.sacred,
					aoe: true
				});
			});
		}

		this.props.clearAction();
		this.props.onChange();
	}

	/* rendering */

	override render(): ReactNode {
		return <>
			<RollCallbackComponent diceRoller={this.props.data.diceRoller}
				handleRoll={this.handlePlayerRoll.bind(this)}/>
			<h3>Divine Intervention</h3>
			<RoomActionButtonListComponent diceRoller={this.props.data.diceRoller}
				rollType={{type: "initiative"}}
				cancelAction={this.props.clearAction}
				completeAction={this.completeDivineIntervention.bind(this)}/>
			<div className="divine-intervention-component">
				<h4>Roll</h4>
				{this.state.playerRoll === undefined && <p>Waiting for Roll</p> }
				{this.state.playerRoll !== undefined && <>
					<p className="divine-intervention-component__roll">
						{this.state.playerRoll}
					</p>
					<ul className="divine-intervention-component__result">
						<li>
							<span className="divine-intervention-component__result-range">
								1-10:
							</span>
							All living party members immediately heal 10 HP (this perk cannot revive dead characters)
						</li>
						{this.state.playerRoll >= 11 && <li>
							<span className="divine-intervention-component__result-range">
								11-15:
							</span>
							As above, plus on the following combat round, the combat slides for all players get rotated to max damage (do not trigger max-damage effects)
						</li>}
						{this.state.playerRoll >= 16 && <li>
							<span className="divine-intervention-component__result-range">
								16-19:
							</span>
							As above, but any special side-effects resulting from max damage activate when the sliders are rotated to max damage
						</li>}
						{this.state.playerRoll >= 20 && <li>
							<span className="divine-intervention-component__result-range">
								20:
							</span>
							As above, plus 100 damage to all monsters (applied when action is completed)
						</li>}
					</ul>
					<a href="https://tokendb.com/token/druegars-sacred-necklace/"
						target="_blank">

						Full Description
					</a>
				</>}
			</div>
		</>;
	}
}
