import React, { Component } from "react";

import { CollapseComponent } from "components/structure/collapseComponent";
import { PlayerComponent } from "components/playerList/playerComponent";

import { PartyCard } from "model/partyCard/partyCard";

interface PlayerListComponentProps {
	partyCard: PartyCard;
	onPlayerChange: () => void;
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
								<PlayerComponent
									player={player}
									onChange={this.props.onPlayerChange}/>
							</li>
						);
					})}
				</ul>
			</CollapseComponent>
		);
	}
}
