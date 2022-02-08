export {}

declare global {
	interface Array<T> {
		separate(separator: (element: T) => boolean): [T[], T[]];
		getItemsInRange(distance: number, centerIndex: number, includeCenter: boolean): T[];
		selectItems(itemCount: number, firstElements?: T[]): T[];
	}
}

Array.prototype.separate = function<T>(this: T[], separator: (element: T) => boolean): [T[], T[]] {
	return this.reduce((results: [T[], T[]], element: T): [T[], T[]] => {

		if (separator(element)) {
			results[0].push(element);
		}
		else {
			results[1].push(element);
		}
		return results;
	}, [[], []]);
}

Array.prototype.getItemsInRange = function<T>(this: T[], distance: number, centerIndex: number, includeCenter: boolean): T[] {
	const firstIndex = centerIndex - distance;
	const wrappedFirstIndex = firstIndex + this.length;

	const lastIndex = centerIndex + distance;
	const wrappedLastIndex = lastIndex - this.length;

	return this.filter((element, index) => {
		if (index === centerIndex) {
			return includeCenter;
		}

		return (index <= wrappedLastIndex) ||
			(index >= wrappedFirstIndex) ||
			((index >= firstIndex) && (index <= lastIndex));
	});
}

Array.prototype.selectItems = function<T>(this: T[], itemCount: number, firstElements: T[] = []): T[] {
	let selectedElements = [...firstElements];

	if (this.length === 0) {
		return selectedElements;
	}

	let remainingElements = this.filter((element) => {
		return !selectedElements.includes(element);
	});

	while (selectedElements.length < itemCount) {
		if (remainingElements.length === 0) {
			remainingElements = [...this];
		}

		const index = Math.floor(Math.random() * remainingElements.length);
		const nextElement = remainingElements[index];
		selectedElements.push(nextElement);

		remainingElements = remainingElements.filter((element) => {
			return element !== nextElement;
		});
	}

	return selectedElements;
}
