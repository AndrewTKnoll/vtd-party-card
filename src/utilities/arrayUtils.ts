export {}

type SeparateResultType<T> = { matches: T[], nonMatches: T[] };

declare global {
	interface Array<T> {
		separate(separator: (element: T) => boolean): SeparateResultType<T>;
		getItemsInRange(distance: number, centerIndex: number, includeCenter: boolean): T[];
		getHighValueItems(evaluator: (item: T) => number): T[];
		selectItems(itemCount: number, firstElements?: T[]): T[];
		selectPriorityItems(itemCount: number, priorityElements: T[], firstElements?: T[]): T[];
	}
}

Array.prototype.separate = function<T>(this: T[], separator: (element: T) => boolean): SeparateResultType<T> {
	return this.reduce((results: SeparateResultType<T>, element) => {
		if (separator(element)) {
			results.matches.push(element);
		}
		else {
			results.nonMatches.push(element);
		}
		return results;
	}, {
		matches: [],
		nonMatches: []
	});
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

Array.prototype.getHighValueItems = function<T>(this: T[], evaluator: (item: T) => number): T[] {
	let highValueItems: T[] = [];
	let highValue = 0;

	this.forEach((item) => {
		const itemValue = evaluator(item);

		if (itemValue > highValue) {
			highValueItems = [item];
			highValue = itemValue;
			return;
		}
		if (itemValue == highValue) {
			highValueItems.push(item);
		}
	});

	return highValueItems;
}

Array.prototype.selectItems = function<T>(this: T[], itemCount: number, firstElements: T[] = []): T[] {
	return this.selectPriorityItems(itemCount, [], firstElements);
}

Array.prototype.selectPriorityItems = function<T>(this: T[], itemCount: number, priorityElements: T[], firstElements: T[] = []): T[] {
	let selectedElements = [...firstElements];

	if (this.length === 0 && priorityElements.length == 0) {
		return selectedElements;
	}

	let remainingPriorityElements = priorityElements.filter((element) => {
		return !selectedElements.includes(element);
	});
	let remainingElements = this.filter((element) => {
		return !selectedElements.includes(element);
	});

	while (selectedElements.length < itemCount) {
		if (remainingElements.length === 0 && remainingPriorityElements.length === 0) {
			remainingPriorityElements = [...priorityElements];
			remainingElements = [...this];
		}

		const elementSource = (remainingPriorityElements.length > 0 ? remainingPriorityElements : remainingElements);

		const nextElement = elementSource[Math.floor(Math.random() * elementSource.length)];
		selectedElements.push(nextElement);

		remainingPriorityElements = remainingPriorityElements.filter((element) => {
			return element !== nextElement;
		});
		remainingElements = remainingElements.filter((element) => {
			return element !== nextElement;
		});
	}

	return selectedElements;
}
