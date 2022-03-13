interface LogItem {
	message: string;
	data?: any;
}

const storageKey = "log";

export class Log {
	private items: LogItem[] = [];

	constructor() {
		try {
			const archiveString = localStorage.getItem(storageKey);
			if (!archiveString) {
				return;
			}
			const archive = JSON.parse(archiveString);

			this.items = archive;

			this.log("page reload");
		}
		catch (error: any) {
			this.items = [];
			this.log("archive read error", error.message);
		}
	}

	log(message: string, data?: any) {
		this.items.push({
			message: message,
			data: data
		});
		this.save();
	}

	clearLog() {
		this.items = [];
		this.save();
	}

	private save() {
		localStorage.setItem(storageKey, JSON.stringify(this.items));
	}

	exportLog() {
		const element = document.createElement("a");

		element.setAttribute("href", `data:application/json;charset=utf-8,${JSON.stringify(this.items)}`);
		element.setAttribute("download", "log.json");

		element.click();
	}
}
