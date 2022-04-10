import React, { Component, ReactNode } from "react";

import { DataManager } from "model/dataManager";
import { nameForDifficulty } from "model/attributes/difficulty";
import { nameForClass } from "model/partyCard/class";
import { Player } from "model/partyCard/player";

import "utilities/arrayUtils";

interface EpilogueComponentProps {
	data: DataManager;
}
interface EpilogueComponentState {}

export class EpilogueComponent extends Component<EpilogueComponentProps, EpilogueComponentState> {

	private renderPlayerList(players: Player[]): ReactNode {
		return <ul className="epilogue-component__player-list">
			{players.map((player) => {
				return (
					<li key={player.class}
						className="epilogue-component__player-label">

						{nameForClass(player.class)}
					</li>
				);
			})}
		</ul>;
	}

	override render(): ReactNode {
		const [deadPlayers, livePlayers] = this.props.data.partyCard.presentPlayers.separate((player) => {
			return player.isDead;
		});

		const [totalTreasure, treasureTaken] = this.props.data.dungeon.rooms.reduce((totals, position) => {
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
				totals[0]++;
			}
			if (treasureTaken) {
				totals[1]++;
			}

			return totals;
		}, [0, 0]);

		return <div className="epilogue-component">
			<h2 className="epilogue-component__title">
				Epilogue
			</h2>
			<div className="row">
				<div className="epilogue-component__info-col col">
					<h3>info</h3>
					<div className="epilogue-component__info-line">
						<span>Difficulty:</span>
						<span>{nameForDifficulty(this.props.data.difficulty)}</span>
					</div>
					<div className="epilogue-component__info-line">
						<span>Rogue Treasures Taken:</span>
						<span>{`${treasureTaken} of ${totalTreasure}`}</span>
					</div>
				</div>
				<div className="epilogue-component__survivors-col col">
					<h3>Survivors</h3>
					{this.renderPlayerList(livePlayers)}
				</div>
				<div className="epilogue-component__casualties-col col">
					<h3>Casualties</h3>
					{this.renderPlayerList(deadPlayers)}
				</div>
			</div>
		</div>;
	}
}
