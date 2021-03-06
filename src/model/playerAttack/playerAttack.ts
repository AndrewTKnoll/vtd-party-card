import { DamageType } from "model/attributes/damageType";
import { Monster } from "model/dungeon/monster";
import { Room } from "model/dungeon/room";
import { Player, WeaponType } from "model/partyCard/player";
import { PlayerAttackCritMultiplier } from "model/playerAttack/playerAttackCritMultiplier";
import { PlayerAttackType } from "model/playerAttack/playerAttackType";

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
		this.room.beforePlayerAttackCompletes(this);

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

		if (this.primaryDamageAmount > 0 && this.primaryTarget) {
			this.primaryTarget.takeDamage({
				type: this.attackType,
				player: this.player,
				amount: this.primaryDamageAmount,
				multiplier: this.primaryCritMultiplier,
				damageType: this.damageType,
				aoe: this.aoeDamageAmount > 0
			});
		}

		if (this.secondaryDamageAmount > 0 && this.secondaryTarget) {
			this.secondaryTarget.takeDamage({
				type: this.attackType,
				player: this.player,
				amount: this.secondaryDamageAmount,
				multiplier: this.secondaryCritMultiplier,
				damageType: this.damageType,
				aoe: this.aoeDamageAmount > 0
			});
		}

		if (this.aoeDamageAmount === 0) {
			return;
		}

		this.room.monsters.forEach((monster) => {
			if (monster === this.primaryTarget && this.primaryDamageAmount > 0) {
				return;
			}
			if (monster === this.secondaryTarget && this.secondaryDamageAmount > 0) {
				return;
			}
			monster.takeDamage({
				type: this.attackType!,
				player: this.player,
				amount: this.aoeDamageAmount,
				multiplier: 1,
				damageType: this.damageType,
				aoe: true
			});
		});
	}
}
