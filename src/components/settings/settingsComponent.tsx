import { Component, ReactNode } from "react";

import { DataManager } from "model/dataManager";

interface SettingsComponentProps {
	data: DataManager;
}
interface SettingsComponentState {}

export class SettingsComponent extends Component<SettingsComponentProps, SettingsComponentState> {

	override render(): ReactNode {
		return this.props.data.diceRoller.authToken ? this.props.data.dungeon.dataVersion : undefined;
	}
}
