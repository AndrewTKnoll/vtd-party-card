export class SocketRequestMessage {
	static sdk(sdk: string): SocketRequestMessage {
		return new SocketRequestMessage("s", {
			c: {
				[sdk]: 1
			}
		});
	}

	static listen(listen: boolean, path: "rolls" | "settings", slotId: string) {
		return new SocketRequestMessage(
			(listen ? "q" : "n"),
			{
				p: `/slots/${slotId}/${path}`,
				h: (listen ? "" : undefined)
			}
		);
	}

	readonly a: string;
	readonly b: SocketRequestSDKPayload | SocketRequestPathPayload;
	private r: number;

	get requestId(): number {
		return this.r;
	}
	set requestId(newValue: number) {
		this.r = newValue;
	}

	private constructor(a: string, b: SocketRequestSDKPayload | SocketRequestPathPayload) {
		this.a = a;
		this.b = b;
		this.r = 0;
	}
}


interface SocketRequestPathPayload {
	readonly p: string;
	readonly h?: string | undefined;
}

interface SocketRequestSDKPayload {
	readonly c: { [key: string]: 1 }
}
