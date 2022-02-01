import React, { Component, ChangeEvent } from "react";

interface BaseItemListSelectComponentProps<ItemType> {
	items: ItemType[];
	labelForItem: (item: ItemType) => string;

	disabled?: boolean | undefined;
}
interface ConcreteItemListSelectComponentProps<ItemType> extends BaseItemListSelectComponentProps<ItemType> {
	isOptional: false;
	selectedItem: ItemType;
	onChange: (newItem: ItemType) => void;
}
interface OptionalItemListSelectComponentProps<ItemType> extends BaseItemListSelectComponentProps<ItemType> {
	isOptional: true;
	selectedItem: ItemType | undefined;
	onChange: (newItem: ItemType | undefined) => void;
}
type ItemListSelectComponentProps<ItemType> = ConcreteItemListSelectComponentProps<ItemType> | OptionalItemListSelectComponentProps<ItemType>;

interface ItemListSelectComponentState {}

export class ItemListSelectComponent<ItemType> extends Component<ItemListSelectComponentProps<ItemType>, ItemListSelectComponentState> {

	private newItemSelected(event: ChangeEvent<HTMLSelectElement>) {
		const index = Number.parseInt(event.target.value);

		if (this.props.isOptional && index === NaN) {
			this.props.onChange(undefined);
			return;
		}
		this.props.onChange(this.props.items[index]);
	}

	override render() {
		return (
			<select value={this.props.selectedItem === undefined ? "none" : this.props.items.indexOf(this.props.selectedItem)}
				disabled={this.props.disabled}
				onChange={this.newItemSelected.bind(this)}>

				{this.props.isOptional && <option value="none">None</option>}
				{this.props.items.map((item, index) => {
					return (
						<option key={index}
							value={index}>

							{this.props.labelForItem(item)}
						</option>
					);
				})}
			</select>
		);
	}
}
