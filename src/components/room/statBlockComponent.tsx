import React, { Component, ReactNode, Fragment } from "react";

import { CollapseComponent } from "components/structure/collapseComponent";

import { StatBlock } from "model/dungeon/statBlock";

interface StatBlockComponentProps {
	statBlocks: StatBlock[];
}
interface StatBlockComponentState {}

export class StatBlockComponent extends Component<StatBlockComponentProps, StatBlockComponentState> {

	private static renderStatBlock(statBlock: StatBlock): ReactNode {
		return <Fragment key={statBlock.name}>
			<h5>{statBlock.name}</h5>
			<table className="info-table">
				<tbody>
					{statBlock.items.map((item, index) => {
						if (!item.value) {
							return false;
						}

						return <tr key={index}>
							<th>{item.label}</th>
							<td>{item.value}</td>
						</tr>;
					})}
				</tbody>
			</table>
		</Fragment>;
	}

	override render(): ReactNode {
		return <CollapseComponent headerText={`Monster Stat Block${this.props.statBlocks.length > 1 ? "s" : ""}`}
			headerLevel="h4"
			contentClass="stat-block-component">

			{this.props.statBlocks.map((statBlock) => {
				return StatBlockComponent.renderStatBlock(statBlock);
			})}
		</CollapseComponent>;
	}
}
