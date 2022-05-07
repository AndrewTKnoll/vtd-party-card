import React, { Component, ReactNode, ChangeEvent } from "react";

interface BaseItemListSelectComponentProps<ItemType> {
	items: ItemType[];
	labelForItem: (item: ItemType) => string;

	disabled?: boolean | undefined;
}
interface ConcreteItemListSelectComponentProps<ItemType> extends BaseItemListSelectComponentProps<ItemType> {
	selectedItem: ItemType;
	onChange: (newItem: ItemType) => void;
}
interface OptionalItemListSelectComponentProps<ItemType> extends BaseItemListSelectComponentProps<ItemType> {
	selectedItem: ItemType | undefined;
	noneLabel?: string;
	onChange: (newItem: ItemType | undefined) => void;
}

export class ItemListSelectComponent<ItemType> extends Component<ConcreteItemListSelectComponentProps<ItemType>> {

	private newItemSelected(event: ChangeEvent<HTMLSelectElement>) {
		const index = Number.parseInt(event.target.value);

		this.props.onChange(this.props.items[index]);
	}

	override render(): ReactNode {
		return <select value={this.props.selectedItem === undefined ? "none" : this.props.items.indexOf(this.props.selectedItem)}
			disabled={this.props.disabled}
			onChange={this.newItemSelected.bind(this)}>

			{this.props.items.map((item, index) => {
				return <option key={index}
					value={index}>

					{this.props.labelForItem(item)}
				</option>;
			})}
		</select>;
	}
}

export class OptionalItemListSelectComponent<ItemType> extends Component<OptionalItemListSelectComponentProps<ItemType>> {

	private labelForItem(item: ItemType | undefined): string {
		if (item === undefined) {
			return this.props.noneLabel ?? "None";
		}
		return this.props.labelForItem(item);
	}

	override render(): ReactNode {
		return <ItemListSelectComponent items={[
				undefined,
				...this.props.items
			]}
			disabled={this.props.disabled}
			labelForItem={this.labelForItem.bind(this)}
			selectedItem={this.props.selectedItem}
			onChange={this.props.onChange}/>;
	}
}
