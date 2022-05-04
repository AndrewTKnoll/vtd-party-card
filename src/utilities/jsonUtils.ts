export type JSONObject = { [key: string]: JSONValue };
export type JSONValue = null | string | number | boolean | JSONValue[] | JSONObject;

export function validate<T extends string | number | boolean>(value: JSONValue | undefined, defaultValue: T, allowedValues?: T[]): T {
	if (allowedValues) {
		return allowedValues.includes(value as T) ? value as T : defaultValue;
	}
	return (typeof(value) === typeof(defaultValue)) ? (value as T) : defaultValue;
}

export function optional<T extends string | number | boolean>(type: "string" | "number" | "boolean", value: JSONValue | undefined, defaultValue: T | undefined, allowedValues?: T[]): T | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}

	if (allowedValues) {
		return allowedValues.includes(value as T) ? value as T : defaultValue;
	}
	return (typeof(value) === type) ? (value as T) : defaultValue;
}

export function isObject(value: JSONValue | undefined): value is JSONObject {
	return (typeof(value) === "object" && !(value instanceof Array));
}

export function isArray(value: JSONValue | undefined): value is JSONValue[] {
	return value instanceof Array;
}
