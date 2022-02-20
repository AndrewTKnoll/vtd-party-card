import { Room, InitiativeWinner } from "model/dungeon/room";

export class InitiativeAction {
	private room: Room;

	readonly monsterRoll = Math.floor(Math.random() * 20) + 1;
	get monsterTotal(): number {
		return this.monsterRoll + this.room.initiativeBonus;
	}

	playerRollReceived = false;
	playerRoll = 0;
	playerTotal = 0;

	get winner(): InitiativeWinner | undefined {
		if (!this.playerRollReceived || this.monsterTotal === this.playerTotal) {
			return undefined;
		}

		return (this.playerTotal > this.monsterTotal) ? InitiativeWinner.players : InitiativeWinner.monster;
	}

	constructor(room: Room) {
		this.room = room;
	}
}
