import { JSONValue, isObject } from "utilities/jsonUtils";

export class DefaultMap<KeyType extends keyof any, Type> {
	private defaultValue: Type;
	private values: { [key: string]: Type };

	constructor(defaultValue: Type, initialValues: { [key: string]: Type } = {}) {
		this.defaultValue = defaultValue;
		this.values = initialValues;
	}

	restoreFromArchive(archive: JSONValue | undefined) {
		if (!isObject(archive)) {
			return;
		}
		this.values = {};

		for (const [key, value] of Object.entries(archive)) {
			if (value === null || typeof(value) === "object" || typeof(value) !== typeof(this.defaultValue)) {
				continue;
			}
			this.values[key] = value as unknown as Type;
		}
	}

	toJSON(): any {
		return this.values;
	}

	get(key: KeyType): Type {
		const storedValue = this.values[`${key}`];
		if (storedValue === undefined) {
			return this.defaultValue;
		}
		return storedValue;
	}

	set(key: KeyType, value: Type) {
		if (value === this.defaultValue) {
			delete this.values[`${key}`];
		}
		else {
			this.values[`${key}`] = value;
		}
	}
}
