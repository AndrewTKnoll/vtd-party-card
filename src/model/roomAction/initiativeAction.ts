import { Room } from "model/dungeon/room";

export class InitiativeAction {
	private room: Room;

	readonly monsterRoll = Math.floor(Math.random() * 20) + 1;
	get monsterTotal(): number {
		return this.monsterRoll + this.room.initiativeBonus;
	}

	playerRollReceived = false;
	playerRoll = 0;
	playerTotal = 0;

	constructor(room: Room) {
		this.room = room;
	}
}
