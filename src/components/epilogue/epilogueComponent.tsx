import React, { Component, ReactNode } from "react";

import { DataManager } from "model/dataManager";

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
		</div>;
	}
}
