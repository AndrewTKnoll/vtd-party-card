import React, { Component } from "react";

import { DifficultyControlComponent } from "components/controls/difficultyControlComponent";
import { RoomControlComponent } from "components/controls/roomControlComponent";

import { PlayerListComponent } from "components/playerList/playerListComponent";

import { ResetLevel } from "model/attributes/resetLevel";
import { PartyCard } from "model/partyCard/partyCard";
import { Dungeon } from "model/dungeon/dungeon";

import { Difficulty } from "model/attributes/difficulty";

const partyCardStorageKey = "partyCard";
const dungeonStorageKey = "dungeon";

interface VDMAssistantComponentProps {}
interface VDMAssistantComponentState {
	partyCard: PartyCard;
	dungeon: Dungeon;
}

export class VDMAssistantComponent extends Component<VDMAssistantComponentProps, VDMAssistantComponentState> {

	constructor(props: VDMAssistantComponentProps) {
		super(props);

		const initialState = {
			partyCard: new PartyCard(),
			dungeon: new Dungeon()
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

		try {
			const dungeonArchive = localStorage.getItem(dungeonStorageKey);
			if (dungeonArchive) {
				initialState.dungeon.restoreFromArchive(JSON.parse(dungeonArchive));
			}
		}
		catch (error) {
			initialState.dungeon = new Dungeon();
		}

		this.state = initialState;
	}

	private setDifficulty(newDifficulty: Difficulty) {
		this.state.dungeon.difficulty = newDifficulty;
		this.forceUpdate();
	}

	private fullReset() {
		if (confirm("Confirm Reset")) {
			this.state.partyCard.reset(ResetLevel.full);
			this.state.dungeon.reset(ResetLevel.full);
			this.forceUpdate();
		}
	}

	override componentDidUpdate() {
		localStorage.setItem(partyCardStorageKey, JSON.stringify(this.state.partyCard));
		localStorage.setItem(dungeonStorageKey, JSON.stringify(this.state.dungeon));
	}

	override render() {
		return (<>
			<PlayerListComponent partyCard={this.state.partyCard}
				onPlayerChange={this.forceUpdate.bind(this)}/>
			<button type="button"
				onClick={this.fullReset.bind(this)}>

				Full Reset
			</button>
			<DifficultyControlComponent difficulty={this.state.dungeon.difficulty}
				onChange={this.setDifficulty.bind(this)}/>
			<RoomControlComponent dungeon={this.state.dungeon}
				onChange={this.forceUpdate.bind(this)}/>
		</>);
	}
}
