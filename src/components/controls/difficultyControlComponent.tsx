import React, { Component, ChangeEvent } from "react";

import { Difficulty, allDifficulties, nameForDifficulty } from "model/attributes/difficulty";

interface DifficultyControlComponentProps {
	difficulty: Difficulty;
	onChange: (newDifficulty: Difficulty) => void;
}
interface DifficultyControlComponentState {}

export class DifficultyControlComponent extends Component<DifficultyControlComponentProps, DifficultyControlComponentState> {

	private newDifficultySelected(event: ChangeEvent<HTMLSelectElement>) {
		const index = Number.parseInt(event.target.value);
		this.props.onChange(allDifficulties[index]);
	}

	override render() {
		return (
			<select value={this.props.difficulty}
				onChange={this.newDifficultySelected.bind(this)}>

				{allDifficulties.map((difficulty, index) => {
					return (
						<option key={difficulty}
							value={index}>

							{nameForDifficulty(difficulty)}
						</option>
					);
				})}
			</select>
		);
	}
}
