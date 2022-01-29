export class DefaultMap<KeyType extends keyof any, Type> {
	private defaultValue: Type;
	private values: { [key: string]: Type | undefined };

	constructor(defaultValue: Type, initialValues: { [key: string]: Type } = {}) {
		this.defaultValue = defaultValue;
		this.values = initialValues;
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
