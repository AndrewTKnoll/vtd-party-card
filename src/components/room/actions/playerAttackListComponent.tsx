import React, { Component, ReactNode, ChangeEvent } from "react";

import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";
import { RoomActionButtonListComponent } from "components/room/roomActionButtonListComponent";
import { CallbackComponent } from "components/widgets/callbackComponent";

import { DataManager } from "model/dataManager";
import { DamageType, allDamageTypes, nameForDamageType } from "model/attributes/damageType";
import { Roll } from "model/diceRoller/roll";
import { Monster } from "model/dungeon/monster";
import { nameForClass } from "model/partyCard/class";
import { PlayerAttack } from "model/playerAttack/playerAttack";
import { PlayerAttackCritMultiplier, allPlayerAttackCritMultipliers, nameForPlayerAttackCritMultiplier } from "model/playerAttack/playerAttackCritMultiplier";
import { PlayerAttackType, allPlayerAttackTypes, nameForPlayerAttackType } from "model/playerAttack/playerAttackType";

interface PlayerAttackListComponentProps {
	data: DataManager;
	isQuickStrike: boolean;
	clearAction: () => void;
	onChange: () => void;
}
interface PlayerAttackListComponentState {
	attacks: PlayerAttack[];
}

function targetLabelForMonster(monster: Monster): string {
	return monster.name;
}

export class PlayerAttackListComponent extends Component<PlayerAttackListComponentProps, PlayerAttackListComponentState> {

	/* lifecycle */

	constructor(props: PlayerAttackListComponentProps) {
		super(props);

		this.state = {
			attacks: props.data.partyCard.activePlayers.filter((player) => {
				return !props.isQuickStrike || player.hasQuickStrike;
			}).map((player) => {
				const attack = new PlayerAttack(player, props.data.currentRoom);
				attack.primaryTarget = props.data.currentRoom.defaultTargetForPlayer(player);
				attack.secondaryTarget = attack.primaryTarget;

				return attack;
			})
		};
	}

	override componentDidMount() {
		this.props.data.diceRoller.rolls.forEach(this.handlePlayerRoll.bind(this));
	}

	/* events */

	private handlePlayerRoll(roll: Roll) {
		if (roll.type !== "attack") {
			return;
		}

		this.state.attacks.forEach((attack) => {
			if (roll.class !== attack.player.class) {
				return;
			}

			switch (roll.attackType) {
				case "melee_main":
					attack.attackType = PlayerAttackType.melee;
					attack.primaryDamageAmount = roll.success ? roll.damage : 0;
					attack.primaryCritMultiplier = roll.dieResult === 20 ? 2 : 1;
					break;
				case "melee_off":
					attack.attackType = PlayerAttackType.melee;
					attack.secondaryDamageAmount = roll.success ? roll.damage : 0;
					attack.secondaryCritMultiplier = roll.dieResult === 20 ? 2 : 1;
					break;
				case "ranged_main":
					attack.attackType = PlayerAttackType.ranged;
					attack.primaryDamageAmount = roll.success ? roll.damage : 0;
					attack.primaryCritMultiplier = roll.dieResult === 20 ? 2 : 1;
					break;
				case "ranged_off":
					attack.attackType = PlayerAttackType.ranged;
					attack.secondaryDamageAmount = roll.success ? roll.damage : 0;
					attack.secondaryCritMultiplier = roll.dieResult === 20 ? 2 : 1;
					break;
				case "spell":
					attack.attackType = PlayerAttackType.spell;
					attack.primaryDamageAmount = roll.success ? roll.damage : 0;
					break;
			}

			this.forceUpdate();
		});
	}

	private attackTypeChanged(attack: PlayerAttack, newAttackType: PlayerAttackType | undefined) {
		attack.attackType = newAttackType;

		if (newAttackType === undefined) {
			attack.damageType = undefined;
		}

		this.forceUpdate();
	}

	private damageTypeChanged(attack: PlayerAttack, newDamageType: DamageType | undefined) {
		attack.damageType = newDamageType;
		this.forceUpdate();
	}

	private targetChanged(attack: PlayerAttack, isPrimary: boolean, newTarget: Monster | undefined) {
		attack[isPrimary ? "primaryTarget" : "secondaryTarget"] = newTarget;
		this.forceUpdate();
	}

	private damageAmountChanged(attack: PlayerAttack, damageKey: `${"primary" | "secondary" | "aoe"}DamageAmount`, event: ChangeEvent<HTMLInputElement>) {
		const newValue = isNaN(event.target.valueAsNumber) ? 0 : Math.round(event.target.valueAsNumber);

		attack[damageKey] = newValue

		event.target.valueAsNumber = newValue;
		this.forceUpdate();
	}

	private critMultiplierChange(attack: PlayerAttack, multiplierKey: `${"primary" | "secondary"}CritMultiplier`, newMultiplier: PlayerAttackCritMultiplier) {
		const oldMultiplier = attack[multiplierKey];

		if (multiplierKey === "primaryCritMultiplier") {
			attack.primaryDamageAmount = Math.round(attack.primaryDamageAmount * newMultiplier / oldMultiplier);
		}
		else {
			attack.secondaryDamageAmount = Math.round(attack.secondaryDamageAmount * newMultiplier / oldMultiplier);
		}

		attack[multiplierKey] = newMultiplier;
		this.forceUpdate();
	}

	private completeAttack(completeAttack: PlayerAttack) {
		completeAttack.complete();

		this.setState((state) => {
			return {
				attacks: state.attacks.filter((attack) => {
					return completeAttack !== attack;
				})
			};
		});
		this.props.onChange();
	}

	private completeAllAttacks() {
		this.state.attacks.forEach((attack) => {
			attack.complete();
		});
		this.props.clearAction();
		this.props.onChange();
	}

	/* rendering */

	override render(): ReactNode {
		return <>
			<CallbackComponent registry={this.props.data.diceRoller.rollCallbacks}
				callback={this.handlePlayerRoll.bind(this)}/>
			<h3>Player Attacks</h3>
			<RoomActionButtonListComponent diceRoller={this.props.data.diceRoller}
				rollType={{type: "attack"}}
				cancelAction={this.props.clearAction}
				completeAction={this.completeAllAttacks.bind(this)}/>
			<ul className="player-attack-list">
				{this.state.attacks.map((attack, index) => {
					return <li key={attack.player.class}
						className={`player-attack-list__attack${attack.attackType === undefined ? " player-attack-list__attack--none" : ""} row`}>

						<div className="player-attack-list__name-col col">
							<span className="player-attack-list__class-name">
								{nameForClass(attack.player.class)}
							</span>
							<button type="button"
								className="player-attack-list__complete-button"
								onClick={() => {
									this.completeAttack(attack);
								}}>

								Complete
							</button>
						</div>
						<div className="player-attack-list__type col">
							<ItemListSelectComponent<PlayerAttackType> isOptional={true}
								items={allPlayerAttackTypes}
								labelForItem={nameForPlayerAttackType}
								selectedItem={attack.attackType}
								onChange={this.attackTypeChanged.bind(this, attack)}/>
							{attack.attackType === PlayerAttackType.melee &&
								<span className="player-attack-list__weapon-label">
									{attack.player.meleeWeapon}
								</span>
							}
							{attack.attackType === PlayerAttackType.ranged &&
								<span className="player-attack-list__weapon-label">
									{attack.player.rangedWeapon}
								</span>
							}
							{attack.attackType === PlayerAttackType.spell && <>
								<ItemListSelectComponent<DamageType> isOptional={true}
									items={allDamageTypes}
									labelForItem={nameForDamageType}
									selectedItem={attack.damageType}
									onChange={this.damageTypeChanged.bind(this, attack)}/>
								<div className="player-attack-list__aoe">
									AoE:
									<input type="number"
										value={attack.aoeDamageAmount}
										onChange={this.damageAmountChanged.bind(this, attack, "aoeDamageAmount")}/>
								</div>
							</>}
						</div>
						<div className="player-attack-list__target col">
							<span className="player-attack-list__target-name">
								First:
							</span>
							<ItemListSelectComponent<Monster> isOptional={true}
								disabled={attack.attackType === undefined}
								items={this.props.data.currentRoom.monsters}
								labelForItem={targetLabelForMonster}
								selectedItem={attack.primaryTarget}
								onChange={this.targetChanged.bind(this, attack, true)}/>
							<input type="number"
								disabled={attack.attackType === undefined}
								value={attack.primaryDamageAmount}
								onChange={this.damageAmountChanged.bind(this, attack, "primaryDamageAmount")}/>
							<ItemListSelectComponent isOptional={false}
								disabled={attack.attackType === undefined}
								items={allPlayerAttackCritMultipliers}
								labelForItem={nameForPlayerAttackCritMultiplier}
								selectedItem={attack.primaryCritMultiplier}
								onChange={this.critMultiplierChange.bind(this, attack, "primaryCritMultiplier")}/>
						</div>
						<div className="player-attack-list__target col">
							<span className="player-attack-list__target-name">
								Second:
							</span>
							<ItemListSelectComponent<Monster> isOptional={true}
								disabled={attack.attackType === undefined}
								items={this.props.data.currentRoom.monsters}
								labelForItem={targetLabelForMonster}
								selectedItem={attack.secondaryTarget}
								onChange={this.targetChanged.bind(this, attack, false)}/>
							<input type="number"
								disabled={attack.attackType === undefined}
								value={attack.secondaryDamageAmount}
								onChange={this.damageAmountChanged.bind(this, attack, "secondaryDamageAmount")}/>
							<ItemListSelectComponent isOptional={false}
								disabled={attack.attackType === undefined}
								items={allPlayerAttackCritMultipliers}
								labelForItem={nameForPlayerAttackCritMultiplier}
								selectedItem={attack.secondaryCritMultiplier}
								onChange={this.critMultiplierChange.bind(this, attack, "secondaryCritMultiplier")}/>
						</div>
					</li>;
				})}
			</ul>
		</>;
	}
}
