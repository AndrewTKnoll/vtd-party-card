import React, { Component, ReactNode } from "react";

import { CollapseComponent } from "components/structure/collapseComponent";

import { ItemOfInterest } from "model/dungeon/room";

interface ItemsOfInterestComponentProps {
	tokens: ItemOfInterest[];
	spells: ItemOfInterest[];
}
interface ItemsOfInterestComponentState {}

export class ItemsOfInterestComponent extends Component<ItemsOfInterestComponentProps, ItemsOfInterestComponentState> {

	private static renderItem(item: ItemOfInterest): ReactNode {
		return <li key={item.name}>
			{!!item.tokenDBLink &&
				<a href={`https://tokendb.com${item.tokenDBLink}`}
					target="_blank">

					{`${item.name}:`}
				</a>
			}
			{!item.tokenDBLink &&
				<span>
					{`${item.name}:`}
				</span>
			}
			<div className="items-of-interest-component__item-description">
				{item.description}
			</div>
		</li>;
	}

	override render(): ReactNode {
		if (this.props.tokens.length === 0 && this.props.spells.length === 0) {
			return undefined;
		}

		return <CollapseComponent headerText="Tokens/Spells of Interest"
			headerLevel="h4"
			contentClass="items-of-interest-component">

			{this.props.tokens.length > 0 &&
				<div className="info-box">
					<h5>Tokens</h5>
					<ul>
						{this.props.tokens.map(ItemsOfInterestComponent.renderItem)}
					</ul>
				</div>
			}
			{this.props.spells.length > 0 &&
				<div className="info-box">
					<h5>Spells/Powers</h5>
					<ul>
						{this.props.spells.map(ItemsOfInterestComponent.renderItem)}
					</ul>
				</div>
			}
		</CollapseComponent>;
	}
}
