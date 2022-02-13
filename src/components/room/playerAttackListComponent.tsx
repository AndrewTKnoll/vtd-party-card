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

	private renderAttackItem(attack: PlayerAttack, index: number): ReactNode {
		return (<>
			<div className="player-attack-list__complete col">
				<button type="button"
					onClick={() => {
						this.props.attackCompleted(attack);
					}}>

					Complete
				</button>
			</div>
			<span className="player-attack-list__title col">
				{nameForClass(attack.player.class)}
			</span>
			<div className="player-attack-list__type col">
				Type:
				<ItemListSelectComponent<PlayerAttackType> isOptional={true}
					items={allPlayerAttackTypes}
					labelForItem={nameForPlayerAttackType}
					selectedItem={attack.attackType}
					onChange={this.attackTypeChanged.bind(this, attack)}/>
				{attack.attackType === PlayerAttackType.melee &&
					<span>{attack.player.meleeWeapon}</span>
				}
				{attack.attackType === PlayerAttackType.ranged &&
					<span>{attack.player.rangedWeapon}</span>
				}
				{attack.attackType === PlayerAttackType.spell &&
					<ItemListSelectComponent<DamageType> isOptional={true}
						items={allDamageTypes}
						labelForItem={nameForDamageType}
						selectedItem={attack.damageType}
						onChange={this.damageTypeChanged.bind(this, attack)}/>
				}
			</div>
			<div className="player-attack-list__target col">
				First:
				<ItemListSelectComponent<Monster> isOptional={true}
					items={this.props.currentRoom.monsters}
					labelForItem={targetLabelForMonster}
					selectedItem={attack.primaryTarget}
					onChange={this.targetChanged.bind(this, attack, true)}/>
				<input type="number"
					value={attack.primaryDamageAmount}
					onChange={this.damageAmountChanged.bind(this, attack, "primaryDamageAmount")}/>
				<ItemListSelectComponent isOptional={false}
					items={allPlayerAttackCritMultipliers}
					labelForItem={nameForPlayerAttackCritMultiplier}
					selectedItem={attack.primaryCritMultiplier}
					onChange={this.critMultiplierChange.bind(this, attack, "primaryCritMultiplier")}/>
			</div>
			<div className="player-attack-list__target col">
				Second:
				<ItemListSelectComponent<Monster> isOptional={true}
					items={this.props.currentRoom.monsters}
					labelForItem={targetLabelForMonster}
					selectedItem={attack.secondaryTarget}
					onChange={this.targetChanged.bind(this, attack, false)}/>
				<input type="number"
					value={attack.secondaryDamageAmount}
					onChange={this.damageAmountChanged.bind(this, attack, "secondaryDamageAmount")}/>
				<ItemListSelectComponent isOptional={false}
					items={allPlayerAttackCritMultipliers}
					labelForItem={nameForPlayerAttackCritMultiplier}
					selectedItem={attack.secondaryCritMultiplier}
					onChange={this.critMultiplierChange.bind(this, attack, "secondaryCritMultiplier")}/>
			</div>
			<div className="player-attack-list__aoe col">
				AoE:
				<input type="number"
					value={attack.aoeDamageAmount}
					onChange={this.damageAmountChanged.bind(this, attack, "aoeDamageAmount")}/>
			</div>
		</>);
	}

	override render() {
		return (<>
			<ul className="player-attack-list">
				{this.props.attacks.map((attack, index) => {
					return (
						<li key={attack.player.class}
							className="row">

							{this.renderAttackItem(attack, index)}
						</li>
					);
				})}
			</ul>
		</>);
	}
}
