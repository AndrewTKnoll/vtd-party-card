import { DataManager } from "model/dataManager";
import { Difficulty } from "model/attributes/difficulty";

import { DefaultMap } from "utilities/defaultMap";

interface StatBlockItemData {
	readonly label: string;
	readonly id?: string | undefined;
	readonly numericValue?: number | { [key: string]: number } | undefined;
	readonly value?: string | ((number: number) => string) | { [key: string]: string } | undefined;
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

	get(identifier: string): StatBlockItem | undefined {
		return this.items.find((item) => {
			return item.id === identifier;
		});
	}
}

export class StatBlockItem {
	private dataManager: DataManager;

	readonly label: string;
	readonly id: string | undefined;

	private _numericValue: number | DefaultMap<Difficulty, number> | undefined;
	get numericValue(): number {
		if (typeof(this._numericValue) === "object") {
			return this._numericValue.get(this.dataManager.difficulty);
		}
		return this._numericValue ?? 0;
	}

	private _value: string | ((number: number) => string) | DefaultMap<Difficulty, string> | undefined;
	get value(): string {
		if (typeof(this._value) === "object") {
			return this._value.get(this.dataManager.difficulty);
		}
		if (typeof(this._value) === "function") {
			return this._value(this.numericValue);
		}
		return this._value ?? `${this.numericValue}`;
	}

	constructor(dataManager: DataManager, data: StatBlockItemData) {
		this.dataManager = dataManager;

		this.label = data.label;
		this.id = data.id;

		this._numericValue = (typeof(data.numericValue) === "object") ? new DefaultMap(0, data.numericValue) : data.numericValue;

		this._value = (typeof(data.value) === "object") ? new DefaultMap("", data.value) : data.value;
	}
}
