import React, { Component, ReactNode } from "react";

import { HeaderLevel } from "utilities/headerLevel";

interface CollapseComponentProps {
	headerText: string;
	headerLevel: HeaderLevel;
	contentClass?: string;
	children: ReactNode;
}

interface CollapseComponentState {
	collapsed: boolean;
}

export class CollapseComponent extends Component<CollapseComponentProps, CollapseComponentState> {

	constructor(props: CollapseComponentProps) {
		super(props);

		this.state = {
			collapsed: true
		};
	}

	private toggleCollapse() {
		this.setState({
			collapsed: !this.state.collapsed
		});
	}

	override render(): ReactNode {
		const HeaderType = this.props.headerLevel;

		const sectionClasses = ["collapse-component"];
		if (this.state.collapsed) {
			sectionClasses.push("collapse-component--collapsed");
		}

		const contentClasses = ["collapse-component__body"];
		if (this.props.contentClass) {
			contentClasses.push(this.props.contentClass.trim());
		}

		return <section className={sectionClasses.join(" ")}>
			<HeaderType className="collapse-component__header">
				<button type="button"
					className="collapse-component__toggle"
					onClick={this.toggleCollapse.bind(this)}>

					{this.props.headerText}
				</button>
			</HeaderType>
			<div className={contentClasses.join(" ")}>
				{this.props.children}
			</div>
		</section>;
	}
}
