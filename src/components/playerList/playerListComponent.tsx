import React, { Component, ReactNode } from "react";

import { ContextData, injectContext } from "components/globalContext";
import { CollapseComponent } from "components/structure/collapseComponent";
import { PlayerComponent } from "components/playerList/playerComponent";

export const PlayerListComponent = injectContext(class extends Component<ContextData> {

	override render(): ReactNode {
		return <CollapseComponent headerText="Players"
			headerLevel="h2">

			<ul className="row player-list-component">
				{this.props.data.partyCard.players.map((player) => {
					return <li key={player.class}
						className="col player-list-component__player-card">

						<PlayerComponent player={player}/>
					</li>;
				})}
			</ul>
		</CollapseComponent>;
	}
});
