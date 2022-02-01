import { DamageType } from "model/attributes/damageType";
import { Player, WeaponType } from "model/partyCard/player";
import { Monster } from "model/dungeon/monster";
import { Room } from "model/dungeon/room";

import { PlayerAttackType } from "model/playerAttack/playerAttackType";
import { PlayerAttackCritMultiplier } from "model/playerAttack/playerAttackCritMultiplier";

export class PlayerAttack {
	readonly player: Player;
	readonly room: Room;

	attackType?: PlayerAttackType | undefined;
	damageType?: DamageType | undefined;

	primaryTarget?: Monster | undefined;
	primaryDamageAmount = 0;
	primaryCritMultiplier: PlayerAttackCritMultiplier = 1;

	secondaryTarget?: Monster | undefined;
	secondaryDamageAmount = 0;
	secondaryCritMultiplier: PlayerAttackCritMultiplier = 1;

	aoeDamageAmount = 0;

	constructor(player: Player, room: Room) {
		this.player = player;
		this.room = room;
	}

	complete() {
		if (!this.attackType) {
			return;
		}

		switch (this.attackType) {
			case PlayerAttackType.melee:
			case PlayerAttackType.spell:
				this.player.currentWeapon = WeaponType.melee;
				break;

			case PlayerAttackType.ranged:
				this.player.currentWeapon = WeaponType.ranged;
		}

		if (this.primaryDamageAmount > 0) {
			this.primaryTarget?.takeDamage(
				this.primaryDamageAmount,
				this.primaryCritMultiplier,
				this.player,
				this.attackType,
				this.damageType,
				this.aoeDamageAmount > 0
			);
		}

		if (this.secondaryDamageAmount > 0) {
			this.secondaryTarget?.takeDamage(
				this.secondaryDamageAmount,
				this.secondaryCritMultiplier,
				this.player,
				this.attackType,
				this.damageType,
				this.aoeDamageAmount > 0
			);
		}

		this.room.monsters.forEach((monster) => {
			if (monster === this.primaryTarget && this.primaryDamageAmount > 0) {
				return;
			}
			if (monster === this.secondaryTarget && this.secondaryDamageAmount > 0) {
				return;
			}
			monster.takeDamage(
				this.aoeDamageAmount,
				1,
				this.player,
				this.attackType!,
				this.damageType,
				true
			);
		})
	}
}
