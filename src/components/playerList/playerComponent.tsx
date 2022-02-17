import React, { Component, ChangeEvent, ReactNode } from "react";

import { ModalComponent } from "components/structure/modalComponent";

import { DamageType, allDamageTypes, nameForDamageType } from "model/attributes/damageType";
import { Room } from "model/dungeon/room";
import { Player, WeaponType } from "model/partyCard/player";
import { nameForClass } from "model/partyCard/class";

interface PlayerComponentProps {
	player: Player;
	currentRoom: Room;
	onChange: () => void;
}
interface PlayerComponentState {}

export class PlayerComponent extends Component<PlayerComponentProps, PlayerComponentState> {

	private setBooleanValue(key: "isPresent" | "isDead" | "isGuarded" | "hasFreeMovement", event: ChangeEvent<HTMLInputElement>) {
		this.props.player[key] = event.target.checked;
		this.props.onChange();
	}

	private setNumberValue(key: "meleeAC" | "rangedAC" | "acAdjust" | "meleeDamageBonus" | "rangedDamageBonus", event: ChangeEvent<HTMLInputElement>) {
		this.props.player[key] = this.getNumberFrom(event);
		this.props.onChange();
	}

	private setStringValue(key: "meleeWeapon" | "rangedWeapon", event: ChangeEvent<HTMLInputElement>) {
		this.props.player[key] = event.target.value;
		this.props.onChange();
	}

	private setDamageType(key: "meleeDamageTypes" | "rangedDamageTypes", type: DamageType, event: ChangeEvent<HTMLInputElement>) {
		this.props.player[key].set(type, this.getNumberFrom(event));
		this.props.onChange();
	}

	private getNumberFrom(event: ChangeEvent<HTMLInputElement>): number {
		const newValue = isNaN(event.target.valueAsNumber) ? 0 : Math.round(event.target.valueAsNumber);

		event.target.valueAsNumber = newValue;
		return newValue;
	}

	private renderStatList(): ReactNode {
		return (
			<ul className="player-stat-list">
				<li className="player-stat-list__header row">
					<label className="col">
						Melee
					</label>
					<label className="col">
						Ranged
					</label>
				</li>
				<li className="player-stat-list__row row">
					<label className="player-stat-list__label col">
						AC
					</label>
					<div className="player-stat-list__input col">
						<input type="number"
							value={this.props.player.meleeAC}
							onChange={this.setNumberValue.bind(this, "meleeAC")}/>
					</div>
					<div className="player-stat-list__input col">
						<input type="number"
							value={this.props.player.rangedAC}
							onChange={this.setNumberValue.bind(this, "rangedAC")}/>
					</div>
				</li>
				<li className="player-stat-list__row row">
					<label className="player-stat-list__label col">
						Weapon
					</label>
					<div className="player-stat-list__input player-stat-list__input--full-width col">
						<input type="text"
							value={this.props.player.meleeWeapon}
							onChange={this.setStringValue.bind(this, "meleeWeapon")}/>
					</div>
					<div className="player-stat-list__input player-stat-list__input--full-width col">
						<input type="text"
							value={this.props.player.rangedWeapon}
							onChange={this.setStringValue.bind(this, "rangedWeapon")}/>
					</div>
				</li>
				<li className="player-stat-list__row row">
					<label className="player-stat-list__label col">
						Damage Bonus
					</label>
					<div className="player-stat-list__input col">
						<input type="number"
							value={this.props.player.meleeDamageBonus}
							onChange={this.setNumberValue.bind(this, "meleeDamageBonus")}/>
					</div>
					<div className="player-stat-list__input col">
						<input type="number"
							value={this.props.player.rangedDamageBonus}
							onChange={this.setNumberValue.bind(this, "rangedDamageBonus")}/>
					</div>
				</li>
				{allDamageTypes.map((damageType: DamageType) => {
					return (
						<li key={damageType}
							className="player-stat-list__row row">

							<label className="player-stat-list__label col">
								{nameForDamageType(damageType)}
							</label>
							<div className="player-stat-list__input col">
								<input type="number"
									value={this.props.player.meleeDamageTypes.get(damageType)}
									onChange={this.setDamageType.bind(this, "meleeDamageTypes", damageType)}/>
							</div>
							<div className="player-stat-list__input col">
								<input type="number"
									value={this.props.player.rangedDamageTypes.get(damageType)}
									onChange={this.setDamageType.bind(this, "rangedDamageTypes", damageType)}/>
							</div>
						</li>
					);
				})}
			</ul>
		);
	}

	override render() {
		const statusNote = this.props.currentRoom.statusForPlayer(this.props.player);

		return (
			<div className={`player-component${this.props.player.isDead ? " player-component--dead" : ""}${this.props.player.isPresent ? "" : " player-component--not-present"}`}>
				<div className="player-component__title-row">
					<h3 className="player-component__title">
						{nameForClass(this.props.player.class)}
					</h3>
					<ModalComponent openButtonText="Edit"
						closeButtonText="Done"
						title={`Edit ${nameForClass(this.props.player.class)}`}
						titleHeaderLevel="h4">

						<div className="player-misc-settings">
							<label>
								<input type="checkbox"
									checked={this.props.player.isPresent}
									onChange={this.setBooleanValue.bind(this, "isPresent")}/>

								Present
							</label>
							<label>
								<input type="checkbox"
									checked={this.props.player.hasFreeMovement}
									onChange={this.setBooleanValue.bind(this, "hasFreeMovement")}/>

								Has Free Movement
							</label>
							<label className="player-misc-settings__ac-adjust">
								Temporary AC Adjust
								<input type="number"
									value={this.props.player.acAdjust}
									onChange={this.setNumberValue.bind(this, "acAdjust")}/>
							</label>
						</div>
						{this.renderStatList()}
					</ModalComponent>
				</div>
				<div className="player-component__checkbox-wrapper">
					<label className="player-component__is-dead">
						<input type="checkbox"
							checked={this.props.player.isDead}
							onChange={this.setBooleanValue.bind(this, "isDead")}/>
						Dead
					</label>
					<label className="player-component__is-guarded">
						<input type="checkbox"
							checked={this.props.player.isGuarded}
							onChange={this.setBooleanValue.bind(this, "isGuarded")}/>
						Guarded
					</label>
					{statusNote !== "" && this.props.player.isActive && <>
						<h4>Status:</h4>
						<span>{statusNote}</span>
					</>}
				</div>
				<div className="player-component__ac-wrapper">
					<h4>AC</h4>
					<span className={this.props.player.currentWeapon === WeaponType.melee ? "active" : ""}>
						{`M: ${this.props.player.meleeAC}`}
					</span>
					<span className={this.props.player.currentWeapon === WeaponType.ranged ? "active" : ""}>
						{`R: ${this.props.player.rangedAC}`}
					</span>
				</div>
			</div>
		);
	}
}
