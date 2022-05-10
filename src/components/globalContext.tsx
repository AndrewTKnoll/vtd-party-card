import React, { Component, ComponentType, createContext } from "react";

import { DataManager } from "model/dataManager";
import { SettingsManager } from "model/settingsManager";

export interface ContextData {
	data: DataManager;
	settings: SettingsManager;
	onChange: () => void;
}

export const GlobalContext = createContext<ContextData | undefined>(undefined);

export function injectContext<Props>(InjectedComponent: ComponentType<Props & ContextData>): ComponentType<Props & Partial<ContextData>> {
	return class extends Component<Props> {
		static override contextType = GlobalContext;
		override context!: ContextData;

		override render() {
			return <InjectedComponent data={this.context.data}
				settings={this.context.settings}
				onChange={this.context.onChange}
				{...this.props}/>;
		}
	}
}
