import { JSONValue } from "utilities/jsonUtils";

export {}

declare global {
	interface Storage {
		readJSON(key: string): JSONValue | undefined;
		writeJSON(key: string, object: any): void;
	}
}

Storage.prototype.readJSON = function(key: string): JSONValue | undefined {
	const archiveString = this.getItem(key);
	if (!archiveString) {
		return undefined;
	}
	try {
		return JSON.parse(archiveString);
	}
	catch (error) {
		return undefined;
	}
}

Storage.prototype.writeJSON = function(key: string, object: any): void {
	this.setItem(key, JSON.stringify((object)));
}
