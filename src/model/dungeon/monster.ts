import { Difficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";

import { Class } from "model/partyCard/class";
import { Player } from "model/partyCard/player";

import { DefaultMap } from "utilities/defaultMap";

export class Monster {
	readonly name: string;

	difficulty = Difficulty.normal;

	private roundDamageFromPlayers = new DefaultMap<Class, number>(0);
	private totalDamageFromPlayers = new DefaultMap<Class, number>(0);

	private _currentDamage = 0;
	get currentDamage(): number {
		return this._currentDamage;
	}
	set currentDamage(newValue: number) {
		this._currentDamage = newValue < 0 ? 0 : newValue;
	}

	private maxHPValues: DefaultMap<Difficulty, number>;
	get maxHP(): number {
		return this.maxHPValues.get(this.difficulty);
	}

	get isAlive(): boolean {
		return this.currentDamage < this.maxHP;
	}

	constructor(name: string, maxHP: { [key: string]: number }) {
		this.name = name;

		this.maxHPValues = new DefaultMap(0, maxHP);
	}

	restoreFromArchive(archive: any) {
		this.roundDamageFromPlayers = new DefaultMap(0, archive.roundDamageFromPlayers.values);
		this.totalDamageFromPlayers = new DefaultMap(0, archive.totalDamageFromPlayers.values);
		this.currentDamage = archive.currentDamage;
	}

	toJSON(): any {
		return {
			roundDamageFromPlayers: this.roundDamageFromPlayers,
			totalDamageFromPlayers: this.totalDamageFromPlayers,
			currentDamage: this.currentDamage
		};
	}

	reset(level: ResetLevel) {
		this.roundDamageFromPlayers = new DefaultMap(0);

		if (level < ResetLevel.full) {
			return;
		}

		this.currentDamage = 0;
		this.totalDamageFromPlayers = new DefaultMap(0);
	}

	get statusNote(): string {
		return "";
	}

	damageFromPlayer(player: Player, roundOnly: boolean): number {
		return (roundOnly ? this.roundDamageFromPlayers : this.totalDamageFromPlayers).get(player.class);
	}

	getHighDamagePlayers(players: Player[], roundOnly: boolean): Player[] {
		let maxDamage = 0;
		let highDamagePlayers = new Array<Player>();

		players.forEach((player) => {
			const playerDamage = this.damageFromPlayer(player, roundOnly);
			if (playerDamage > maxDamage) {
				maxDamage = playerDamage;
				highDamagePlayers = [player];
			}
			else if (playerDamage === maxDamage) {
				highDamagePlayers.push(player);
			}
		});

		return highDamagePlayers;
	}
}
