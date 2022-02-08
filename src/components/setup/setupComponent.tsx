import React, { Component } from "react";

import { ItemListSelectComponent } from "components/controls/itemListSelectComponent";
import { CollapseComponent } from "components/structure/collapseComponent";

import { Difficulty, allDifficulties, nameForDifficulty } from "model/attributes/difficulty";
import { ResetLevel } from "model/attributes/resetLevel";
import { DataManager } from "model/dataManager";

interface SetupComponentProps {
	data: DataManager;
	onChange: () => void;
}
interface SetupComponentState {}

export class SetupComponent extends Component<SetupComponentProps, SetupComponentState> {

	private setDifficulty(newDifficulty: Difficulty) {
		this.props.data.difficulty = newDifficulty;
		this.props.onChange();
	}

	private fullReset() {
		if (confirm("Confirm Reset")) {
			this.props.data.reset(ResetLevel.full);
			this.props.onChange();
		}
	}

	private copyPasswordToClipboard() {
		navigator.clipboard.writeText(this.props.data.dungeon.eventPasswords[this.props.data.difficulty]);
	}

	override render() {
		return (
			<CollapseComponent headerText="Setup"
				headerLevel="h2"
				contentClass="row">

				<div className="col">
					<button type="button"
						onClick={this.fullReset.bind(this)}>

						Full Reset
					</button>
				</div>
				<label className="col">
					Difficulty:

					<ItemListSelectComponent isOptional={false}
						items={allDifficulties}
						labelForItem={nameForDifficulty}
						selectedItem={this.props.data.difficulty}
						onChange={this.setDifficulty.bind(this)}/>
				</label>
				<div className="col">
					<span>
						{`Event Password: ${this.props.data.dungeon.eventPasswords[this.props.data.difficulty]}`}
					</span>
					<button type="button"
						onClick={this.copyPasswordToClipboard.bind(this)}>

						Copy to Clipboard
					</button>
				</div>
			</CollapseComponent>
		);
	}
}
