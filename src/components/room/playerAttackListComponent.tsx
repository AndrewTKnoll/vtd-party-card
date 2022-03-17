import React, { Component, ReactNode, ChangeEvent } from "react";

import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";

import { DamageType, allDamageTypes, nameForDamageType } from "model/attributes/damageType";
import { Monster } from "model/dungeon/monster";
import { Room } from "model/dungeon/room";
import { nameForClass } from "model/partyCard/class";

import { PlayerAttack } from "model/playerAttack/playerAttack";
import { PlayerAttackType, allPlayerAttackTypes, nameForPlayerAttackType } from "model/playerAttack/playerAttackType";
import { PlayerAttackCritMultiplier, allPlayerAttackCritMultipliers, nameForPlayerAttackCritMultiplier } from "model/playerAttack/playerAttackCritMultiplier";

interface PlayerAttackListComponentProps {
	currentRoom: Room;
	attacks: PlayerAttack[];
	attackCompleted: (attack: PlayerAttack) => void;
}
interface PlayerAttackListComponentState {}

function targetLabelForMonster(monster: Monster): string {
	return monster.name;
}

export class PlayerAttackListComponent extends Component<PlayerAttackListComponentProps, PlayerAttackListComponentState> {

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
		attack[multiplierKey] = newMultiplier;
		this.forceUpdate();
	}

	override render(): ReactNode {
		return (<>
			<h3>Player Attacks</h3>
			<ul className="player-attack-list">
				{this.props.attacks.map((attack, index) => {
					return (
						<li key={attack.player.class}
							className={`player-attack-list__attack${attack.attackType === undefined ? " player-attack-list__attack--none" : ""} row`}>

							<div className="player-attack-list__name-col col">
								<span className="player-attack-list__class-name">
									{nameForClass(attack.player.class)}
								</span>
								<button type="button"
									className="player-attack-list__complete-button"
									onClick={() => {
										this.props.attackCompleted(attack);
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
									items={this.props.currentRoom.monsters}
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
									items={this.props.currentRoom.monsters}
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
						</li>
					);
				})}
			</ul>
		</>);
	}
}
