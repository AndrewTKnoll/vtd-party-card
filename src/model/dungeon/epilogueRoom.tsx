import React, { ReactNode } from "react";

import { DataManager } from "model/dataManager";
import { nameForDifficulty } from "model/attributes/difficulty";
import { Room } from "model/dungeon/room";
import { Class, nameForClass } from "model/partyCard/class";
import { Player } from "model/partyCard/player";

export class EpilogueRoom extends Room {

	constructor(dataManager: DataManager) {
		super({
			dataManager: dataManager,
			name: "Epilogue",
			id: "Epilogue",
			idIsStandalone: true,
			hideRoomTimer: true,
			hideDefaultPushDamage: true
		});
	}

	/* data override points */

	override infoColumnNotes(update: () => void): ReactNode {
		const { totalTreasure, treasureTaken } = this.dataManager.dungeon.rooms.reduce((totals, position) => {
			let hasTreasure = false;
			let treasureTaken = false;

			position.forEach((room) => {
				if (room.hasRogueTreasure) {
					hasTreasure = true;

					if (room.rogueTookTreasure) {
						treasureTaken = true;
					}
				}
			});

			if (hasTreasure) {
				totals.totalTreasure++;
			}
			if (treasureTaken) {
				totals.treasureTaken++;
			}

			return totals;
		}, { totalTreasure: 0, treasureTaken: 0 });

		return <>
			<div className="room-component__info-line">
				<span>Difficulty:</span>
				<span>{nameForDifficulty(this.dataManager.difficulty)}</span>
			</div>
			<div className="room-component__info-line">
				<span>Rogue treasures taken:</span>
				<span>{this.dataManager.partyCard.player(Class.rogue).isPresent ? `${treasureTaken} of ${totalTreasure}` : "No Rogue"}</span>
			</div>
		</>;
	}

	private renderPlayerList(players: Player[]): ReactNode {
		return <ul className="epilogue-component__player-list">
			{players.map((player) => {
				return <li key={player.class}
					className="epilogue-component__player-label">

					{nameForClass(player.class)}
				</li>;
			})}
		</ul>;
	}

	override secondaryColumnNotes(update: () => void): ReactNode {
		const { matches: deadPlayers, nonMatches: livePlayers } = this.dataManager.partyCard.presentPlayers.separate((player) => {
			return player.isDead;
		});

		return <div className="row">
			<div className="col">
				<h3>Survivors</h3>
				{this.renderPlayerList(livePlayers)}
			</div>
			<div className="col">
				<h3>Casualties</h3>
				{this.renderPlayerList(deadPlayers)}
			</div>
		</div>;
	}
}
