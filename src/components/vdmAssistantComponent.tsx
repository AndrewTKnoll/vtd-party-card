import React, { Component } from "react";

import { PlayerListComponent } from "components/playerList/playerListComponent";

import { PartyCard } from "model/partyCard/partyCard";

interface VDMAssistantComponentProps {}
interface VDMAssistantComponentState {
	partyCard: PartyCard;
}

export class VDMAssistantComponent extends Component<VDMAssistantComponentProps, VDMAssistantComponentState> {

	constructor(props: VDMAssistantComponentProps) {
		super(props);

		this.state = {
			partyCard: new PartyCard()
		};
	}

	override render() {
		return (
			<PlayerListComponent partyCard={this.state.partyCard}
				onPlayerChange={this.forceUpdate.bind(this)}/>
		);
	}
}
