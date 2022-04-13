import { DataManager } from "model/dataManager";
import { Difficulty } from "model/attributes/difficulty";

import { DefaultMap } from "utilities/defaultMap";

interface StatBlockItemData {
	readonly label: string;
	readonly value: string | { [key: string]: string };
}

export class StatBlock {
	readonly name: string;
	readonly items: StatBlockItem[];

	constructor(dataManager: DataManager, name: string, items: StatBlockItemData[]) {
		this.name = name;

		this.items = items.map((itemData) => {
			return new StatBlockItem(dataManager, itemData);
		});
	}
}

class StatBlockItem {
	private dataManager: DataManager;

	readonly label: string;

	private _value: string | DefaultMap<Difficulty, string>;
	get value(): string {
		if (typeof(this._value) === "string") {
			return this._value;
		}
		return this._value.get(this.dataManager.difficulty);
	}

	constructor(dataManager: DataManager, data: StatBlockItemData) {
		this.dataManager = dataManager;

		this.label = data.label;

		if (typeof(data.value) === "string") {
			this._value = data.value;
		}
		else {
			this._value = new DefaultMap("", data.value);
		}
	}
}
