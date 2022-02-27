import { SocketRequestMessage } from "model/diceRoller/socket/socketRequestMessage";
import { SocketResponseMessage, parseResponse } from "model/diceRoller/socket/socketResponseMessage";

export class SocketWrapper {
	private socket: WebSocket;
	private pingIntervalId?: number;

	private requestCount = 0;
	private pendingMessages: SocketRequestMessage[] = [];

	private messageCallback: (message: SocketResponseMessage) => void;
	private errorCallback: (error: string, notifiy: boolean) => void;

	constructor(url: string, messageCallback: (message: SocketResponseMessage) => void, errorCallback: (error: string, notify: boolean) => void) {
		this.socket = new WebSocket(url);

		this.socket.addEventListener("open", this.socketOpened.bind(this));
		this.socket.addEventListener("message", this.receiveMessage.bind(this));
		this.socket.addEventListener("error", this.receivedError.bind(this));

		this.messageCallback = messageCallback;
		this.errorCallback = errorCallback;
	}

	private resetPing() {
		if (this.pingIntervalId) {
			clearInterval(this.pingIntervalId);
		}
		this.pingIntervalId = window.setInterval(() => {
			this.socket.send("0");
		}, 45000);
	}

	private socketOpened(event: any) {
		this.resetPing();

		this.pendingMessages.forEach((message) => {
			this.sendMessage(message);
		});
		this.pendingMessages = [];
	}

	close() {
		this.socket.close();

		if (this.pingIntervalId) {
			clearInterval(this.pingIntervalId);
		}
	}

	private receivedError(event: any) {
		this.handleError("unidentified socket error", false);
	}

	private handleError(error: string, notify: boolean) {
		this.errorCallback(error, notify);
		this.close();
	}

	private receiveMessage(event: any) {
		try {
			const data = JSON.parse(event.data);
			this.messageCallback(parseResponse(data.d));
		}
		catch (error) {
			this.handleError(`${error}`, true);
		}
	}

	send(message: SocketRequestMessage) {
		message.requestId = ++this.requestCount;

		if (this.socket.readyState !== 1) {
			this.pendingMessages.push(message);
			return;
		}
		this.sendMessage(message);
	}

	private sendMessage(message: SocketRequestMessage) {
		try {
			this.socket.send(JSON.stringify({
				t: "d",
				d: message
			}));
			this.resetPing();
		}
		catch (error) {
			this.handleError(`${error}`, true);
		}
	}
}
