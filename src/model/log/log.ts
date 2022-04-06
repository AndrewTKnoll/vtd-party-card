import { DataManager } from "model/dataManager";

interface LogItem {
	message: string;
	timestamp: Date;
	data?: any;
}

const storageKey = "log";

export class Log {
	private dataManager: DataManager;

	private items: LogItem[] = [];

	constructor(dataManager: DataManager) {
		this.dataManager = dataManager;

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
			timestamp: new Date(),
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

	private get fileName(): string {
		const date = this.dataManager.localOffsetStartTime;

		if (!date) {
			return "log";
		}
		return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}_${new String(date.getMinutes()).padStart(2, "0")} log`;
	}

	exportLog() {
		const element = document.createElement("a");

		element.setAttribute("href", `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.items))}`);
		element.setAttribute("download", `${this.fileName}.json`);

		element.click();
	}
}
