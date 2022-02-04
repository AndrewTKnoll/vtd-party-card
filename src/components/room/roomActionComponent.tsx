import React, { Component, ReactNode } from "react";

import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";

import { shortNameForSaveType } from "model/attributes/saveType";

import { Room } from "model/dungeon/room";

import { nameForClass } from "model/partyCard/class";
import { PartyCard } from "model/partyCard/partyCard";
import { WeaponType } from "model/partyCard/player";

import { MonsterAttack, MonsterSaveAttack, MonsterAttackType, MonsterSaveAttackResult, allMonsterSaveAttackResults, nameForMonsterSaveAttackResult } from "model/roomAction/monsterAttack";
import { RoomAction } from "model/roomAction/roomAction";
import { RoomActionResult } from "model/roomAction/roomActionResult";

interface RoomActionComponentProps {
	currentRoom: Room;
	partyCard: PartyCard;
	actionCompleted: () => void;
}
interface RoomActionComponentState {
	result: RoomActionResult | undefined;
}

export class RoomActionComponent extends Component<RoomActionComponentProps, RoomActionComponentState> {

	constructor(props: RoomActionComponentProps) {
		super(props);

		this.state = {
			result: undefined
		};
	}

	private performAction(action: RoomAction) {
		this.setState({
			result: action.perform(this.props.partyCard)
		});
	}

	clearResults() {
		this.setState({
			result: undefined
		});
	}

	private completeAction() {
		this.state.result?.complete();
		this.clearResults();
	}

	private saveAttackResultChanged(attack: MonsterSaveAttack, newResult: MonsterSaveAttackResult | undefined) {
		attack.result = newResult;
		this.forceUpdate();
	}

	private renderAttack(attack: MonsterAttack): ReactNode {
		let resultText = "";

		if (attack.type === MonsterAttackType.weapon) {
			const guard = (attack.paladin ? "(guard) " : "");
			const result = (attack.isHit ? `Hit: ${attack.damageAmount} ${attack.damageType}` : "Miss");
			resultText = `${guard}${result}${attack.note ? ` ${attack.note}` : ""}`;
		}
		else {
			if (attack.result === MonsterSaveAttackResult.success) {
				resultText = attack.successMessage;
			}
			if (attack.result === MonsterSaveAttackResult.failure) {
				resultText = attack.failureMessage;
			}
		}

		return (<>
			<span className="room-action-result-list__title col">
				{nameForClass(attack.target.class)}
			</span>
			<span className="room-action-result-list__target col">
				{attack.type === MonsterAttackType.weapon ?
					`${attack.effectiveAC} ${attack.effectiveWeapon === WeaponType.melee ?
					"M" : "R"}` : shortNameForSaveType(attack.save)
				}
			</span>
			<span className="room-action-result-list__roll col">
				{(attack.type === MonsterAttackType.weapon) &&
					`${attack.hit.auto ? "Auto" : `${attack.hit.total} (${attack.hit.roll})`}`
				}
				{(attack.type === MonsterAttackType.save) &&
					<ItemListSelectComponent<MonsterSaveAttackResult> isOptional={true}
						items={allMonsterSaveAttackResults}
						labelForItem={nameForMonsterSaveAttackResult}
						selectedItem={attack.result}
						onChange={this.saveAttackResultChanged.bind(this, attack)}/>
				}
			</span>
			<span className="room-action-result-list__result col">
				{resultText}
			</span>
		</>);
	}

	override render() {
		return (<>
			{this.props.currentRoom.actions.map((action) => {
				return (
					<button key={action.name}
						type="button"
						disabled={this.state.result !== undefined}
						onClick={this.performAction.bind(this, action)}>

						{action.name}
					</button>
				);
			})}
			<button type="button"
				disabled={this.state.result === undefined}
				onClick={this.clearResults.bind(this)}>

				Clear Room Action
			</button>
			<button type="button"
				disabled={this.state.result === undefined}
				onClick={this.completeAction.bind(this)}>

				Complete Room Action
			</button>
			<ul className="room-action-result-list">
				{this.state.result?.attacks.map((attack, index) => {
					return (
						<li key={index}
							className="row">

							{this.renderAttack(attack)}
						</li>
					);
				})}
			</ul>
		</>);
	}
}
