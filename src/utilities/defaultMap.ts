export class DefaultMap<Type> {
	private defaultValue: Type;
	private values: { [key: string]: Type | undefined };

	constructor(defaultValue: Type, initialValues: { [key: string]: Type } = {}) {
		this.defaultValue = defaultValue;
		this.values = initialValues;
	}

	get(key: string): Type {
		const storedValue = this.values[key];
		if (storedValue === undefined) {
			return this.defaultValue;
		}
		return storedValue;
	}

	set(key: string, value: Type) {
		if (value === this.defaultValue) {
			delete this.values[key];
		}
		else {
			this.values[key] = value;
		}
	}
}
