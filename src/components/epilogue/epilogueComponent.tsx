import React, { Component, ReactNode } from "react";

import { DataManager } from "model/dataManager";
import { nameForDifficulty } from "model/attributes/difficulty";

interface EpilogueComponentProps {
	data: DataManager;
}
interface EpilogueComponentState {}

export class EpilogueComponent extends Component<EpilogueComponentProps, EpilogueComponentState> {

	override render(): ReactNode {
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
				</div>
			</div>
		</div>;
	}
}
