import React, { Component } from "react";

import { CollapseComponent } from "components/structure/collapseComponent";
import { PlayerComponent } from "components/playerList/playerComponent";

import { Room } from "model/dungeon/room";
import { PartyCard } from "model/partyCard/partyCard";

interface PlayerListComponentProps {
	partyCard: PartyCard;
	currentRoom: Room;
	onChange: () => void;
}
interface PlayerListComponentState {}

export class PlayerListComponent extends Component<PlayerListComponentProps, PlayerListComponentState> {

	override render() {
		return (
			<CollapseComponent headerText="Players"
				headerLevel="h2">

				<ul className="row player-list-component">
					{this.props.partyCard.players.map((player) => {
						return (
							<li key={player.class}
								className="col player-list-component__player-card">
								<PlayerComponent player={player}
									currentRoom={this.props.currentRoom}
									onChange={this.props.onChange}/>
							</li>
						);
					})}
				</ul>
			</CollapseComponent>
		);
	}
}
