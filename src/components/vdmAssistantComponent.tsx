import React, { Component } from "react";

import { PlayerListComponent } from "components/playerList/playerListComponent";

import { ResetLevel } from "model/attributes/resetLevel";
import { PartyCard } from "model/partyCard/partyCard";

interface VDMAssistantComponentProps {}
interface VDMAssistantComponentState {
	partyCard: PartyCard;
}

const partyCardStorageKey = "partyCard";

export class VDMAssistantComponent extends Component<VDMAssistantComponentProps, VDMAssistantComponentState> {

	constructor(props: VDMAssistantComponentProps) {
		super(props);

		const initialState = {
			partyCard: new PartyCard()
		};

		try {
			const partyCardArchive = localStorage.getItem(partyCardStorageKey);
			if (partyCardArchive) {
				initialState.partyCard.restoreFromArchive(JSON.parse(partyCardArchive));
			}
		}
		catch (error) {
			initialState.partyCard = new PartyCard();
		}

		this.state = initialState;
	}

	private fullReset() {
		if (confirm("Confirm Reset")) {
			this.state.partyCard.reset(ResetLevel.full);
			this.forceUpdate();
		}
	}

	override componentDidUpdate() {
		localStorage.setItem(partyCardStorageKey, JSON.stringify(this.state.partyCard));
	}

	override render() {
		return (<>
			<PlayerListComponent partyCard={this.state.partyCard}
				onPlayerChange={this.forceUpdate.bind(this)}/>
			<button type="button"
				onClick={this.fullReset.bind(this)}>

				Full Reset
			</button>
		</>);
	}
}
