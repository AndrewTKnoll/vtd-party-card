export class CallbackRegistry<CallbackType extends (...args: any[]) => any> {
	private callbacks: { [key: number]: CallbackType} = {};
	private nextCallbackId = 0;

	register(callback: CallbackType): number {
		const callbackId = this.nextCallbackId;

		this.nextCallbackId++;
		this.callbacks[callbackId] = callback;

		return callbackId;
	}

	unregister(id: number) {
		delete(this.callbacks[id]);
	}

	trigger(...args: Parameters<CallbackType>) {
		for (const callback in this.callbacks) {
			this.callbacks[callback](...args);
		}
	}
}
