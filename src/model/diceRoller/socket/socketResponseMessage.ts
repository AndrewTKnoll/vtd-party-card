export type SocketResponseMessage = StartupSocketResponse | MessageResponseSocketResponse | SettingsChangeSocketResponse | RollChangeSocketResponse | UnknownSocketResponse;

export function parseResponse(data: any): SocketResponseMessage {
	return isStartup(data) || isMessageResponse(data) || isStateChange(data) || {
		type: "unknown"
	};
}

export interface StartupSocketResponse {
	type: "startup";
	connectionId: string;
}

function isStartup(data: any): StartupSocketResponse | undefined {
	if (
		data.t !== "h" ||
		!data.d ||
		typeof(data.d.h) !== "string" ||
		typeof(data.d.s) !== "string" ||
		typeof(data.d.ts) !== "number" ||
		typeof(data.d.v) !== "string"
	) {
		return undefined;
	}

	return {
		type: "startup",
		connectionId: data.d.s
	};
}

export interface MessageResponseSocketResponse {
	type: "response";
	requestId: number;
	status: string;
}

function isMessageResponse(data: any): MessageResponseSocketResponse | undefined {
	if (
		typeof(data.r) !== "number" ||
		!data.b ||
		typeof(data.b.s) !== "string"
	) {
		return undefined;
	}

	return {
		type: "response",
		requestId: data.r,
		status: data.b.s
	};
}

export interface SettingsChangeSocketResponse {
	type: "settings";
	rollState?: string | undefined;
	roll?: string | undefined;
	reveal?: string | undefined;
	saveRollType?: string | undefined;
	showSlotIdInOBS?: boolean | undefined;
}

export interface RollChangeSocketResponse {
	type: "roll";
	clear: boolean;
	rolls: RollChangeData[];
}

export interface RollChangeData {
	classId: string;
	eventType: string;
	rolls: RollChangeDataRoll[];
	slotId: string;
}

export interface RollChangeDataRoll {
	damage?: number | undefined;
	dieResult: number;
	isSuccess?: boolean | undefined;
	modifiedResult: number;
	type?: string | undefined;
	effect?: string | undefined;
}

function isStateChange(data: any): SettingsChangeSocketResponse | RollChangeSocketResponse | undefined {
	if (
		(data.a !== "d" && data.a !== "m") ||
		!data.b ||
		typeof(data.b.p) !== "string"
	) {
		return undefined;
	}

	if (data.b.p.includes("/settings")) {
		return {
			type: "settings",
			...data.b.d
		};
	}

	if (data.b.p.endsWith("/rolls")) {
		if (!data.b.d) {
			return {
				type: "roll",
				clear: true,
				rolls: []
			};
		}

		return {
			type: "roll",
			clear: false,
			rolls: Object.keys(data.b.d).map((key) => {
				return mapRollChangeData(data.b.d[key]);
			})
		}
	}

	if (data.b.p.includes("/rolls")) {
		return {
			type: "roll",
			clear: false,
			rolls: [mapRollChangeData(data.b.d)]
		};
	}

	return undefined;
}

function mapRollChangeData(data: any): RollChangeData {
	return {
		...data,
		rolls: Object.keys(data.rolls).map((key) => {
			return data.rolls[key];
		})
	};
}

export interface UnknownSocketResponse {
	type: "unknown";
}
