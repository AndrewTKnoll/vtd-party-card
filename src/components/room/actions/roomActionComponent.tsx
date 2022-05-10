import React, { Component, ReactNode } from "react";

import { ContextData, injectContext } from "components/globalContext";
import { OptionalItemListSelectComponent } from "components/controls/itemListSelectComponent";
import { RoomActionButtonListComponent } from "components/room/roomActionButtonListComponent";
import { CallbackComponent } from "components/widgets/callbackComponent";

import { shortNameForSaveType } from "model/attributes/saveType";
import { Roll } from "model/diceRoller/roll";
import { MonsterSaveAttack, MonsterSaveAttackResult, allMonsterSaveAttackResults, nameForMonsterSaveAttackResult } from "model/monsterAttack/monsterSaveAttack";
import { MonsterSpecialAttack } from "model/monsterAttack/monsterSpecialAttack";
import { MonsterWeaponAttack } from "model/monsterAttack/monsterWeaponAttack";
import { nameForClass } from "model/partyCard/class";
import { RoomActionResult, MonsterAttack, MonsterAttackType } from "model/roomAction/roomActionResult";

type RoomActionComponentProps = ContextData & {
	clearAction: () => void;
	result: RoomActionResult;
}

export const RoomActionComponent = injectContext(class extends Component<RoomActionComponentProps> {

	/* lifecycle */

	override componentDidMount() {
		this.props.data.diceRoller.rolls.forEach(this.handlePlayerRoll.bind(this));
	}

	/* events */

	private handlePlayerRoll(roll: Roll) {
		if (roll.type !== "save") {
			return;
		}

		this.props.result.attacks.forEach((attack) => {
			if (
				attack.type !== "save" ||
				attack.save !== roll.saveType ||
				roll.class !== attack.target.class
			) {
				return;
			}

			if (attack.dc) {
				attack.result = (roll.modifiedResult >= attack.dc) ? MonsterSaveAttackResult.success : MonsterSaveAttackResult.failure;
			}
			else {
				attack.result = (roll.success ? MonsterSaveAttackResult.success : MonsterSaveAttackResult.failure);
			}

			this.forceUpdate();
		});
	}

	private completeRoomAction() {
		this.props.result.complete();
		this.props.clearAction();
		this.props.onChange();
	}

	private saveAttackResultChanged(attack: MonsterSaveAttack, newResult: MonsterSaveAttackResult | undefined) {
		attack.result = newResult;
		this.forceUpdate();
	}

	/* rendering */

	private renderWeaponAttack(attack: MonsterWeaponAttack): ReactNode {
		const guard = (attack.paladin ? "(guard) " : "");
		const autoHit = !attack.hit.auto && (attack.hit.roll >= attack.autoHitThreshold) && (attack.hit.total < attack.effectiveAC) ? ` (nat ${attack.hit.roll})` : "";
		const autoMiss = !attack.hit.auto && (attack.hit.roll === 1) && (attack.hit.total >= attack.effectiveAC) ? ` (nat 1)` : "";
		const result = (attack.isHit ? `Hit${autoHit}: ${attack.damageAmount} ${attack.damageType}` : `Miss ${autoMiss}`);
		const retribution = (attack.triggersRetributionDamage ? ` - ${attack.effectiveTarget.retributionDamageTotal} Retribution` : "");

		return <>
			<span className="room-action-result-list__title col">
				{nameForClass(attack.target.class)}
			</span>
			<span className="room-action-result-list__target col">
				{`${attack.effectiveAC} ${attack.effectiveACType.charAt(0).toUpperCase()}`}
			</span>
			<span className="room-action-result-list__roll col">
				{`${attack.hit.auto ? "Auto" : `${attack.hit.total} (${attack.hit.roll})`}`}
			</span>
			<span className="room-action-result-list__result col">
				{`${guard}${result}${attack.note ? ` (${attack.note})` : ""}${retribution}`}
			</span>
		</>;
	}

	private renderSaveAttack(attack: MonsterSaveAttack): ReactNode {
		let resultText = "";

		if (attack.result === MonsterSaveAttackResult.success) {
			resultText = attack.successMessage;
		}
		if (attack.result === MonsterSaveAttackResult.failure) {
			resultText = attack.failureMessage;
		}
		if (attack.immuneMessage) {
			resultText = attack.immuneMessage;
		}

		return <>
			<span className="room-action-result-list__title col">
				{nameForClass(attack.target.class)}
			</span>
			<span className="room-action-result-list__target col">
				{shortNameForSaveType(attack.save)}
			</span>
			<span className="room-action-result-list__roll col">
				<OptionalItemListSelectComponent items={allMonsterSaveAttackResults}
					labelForItem={nameForMonsterSaveAttackResult}
					selectedItem={attack.result}
					onChange={this.saveAttackResultChanged.bind(this, attack)}/>
			</span>
			<span className="room-action-result-list__result col">
				{resultText}
			</span>
		</>;
	}

	private renderSpecialAttack(attack: MonsterSpecialAttack): ReactNode {
		return <>
			<span className="room-action-result-list__title col">
				{nameForClass(attack.target.class)}
			</span>
			<div className="room-action-result-list__special-result col">
				{attack.description(this.props.onChange)}
			</div>
		</>;
	}

	private renderAttack(attack: MonsterAttack): ReactNode {
		switch (attack.type) {
			case MonsterAttackType.weapon:
				return this.renderWeaponAttack(attack);
			case MonsterAttackType.save:
				return this.renderSaveAttack(attack);
			case MonsterAttackType.special:
				return this.renderSpecialAttack(attack);
		}
	}

	override render(): ReactNode {
		return <>
			<CallbackComponent registry={this.props.data.diceRoller.rollCallbacks}
				callback={this.handlePlayerRoll.bind(this)}/>
			<h3>{this.props.result.action.name}</h3>
			<RoomActionButtonListComponent rollType={this.props.result.action.associatedSave !== undefined ? { type: "save", save: this.props.result.action.associatedSave } : undefined}
				cancelAction={this.props.clearAction}
				completeAction={this.completeRoomAction.bind(this)}/>
			<ul className="room-action-result-list">
				{this.props.result?.attacks.map((attack, index) => {
					return <li key={index}
						className="room-action-result-list__attack row">

						{this.renderAttack(attack)}
					</li>;
				})}
			</ul>
		</>;
	}
});
