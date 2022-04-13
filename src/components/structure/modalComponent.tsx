import React, { Component, ReactNode, MouseEvent } from "react";

import { HeaderLevel } from "utilities/headerLevel";

interface ModalComponentProps {
	openButtonText: string;
	closeButtonText?: string;
	title: string;
	titleHeaderLevel: HeaderLevel;
	contentClass?: string;
	children: ReactNode;
}

interface ModalComponentState {
	shown: boolean
}

export class ModalComponent extends Component<ModalComponentProps, ModalComponentState> {

	constructor(props: ModalComponentProps) {
		super(props);

		this.state = {
			shown: false
		};
	}

	private toggleShown(shown: boolean) {
		this.setState({
			shown: shown
		});
		document.body.style.overflow = shown ? "hidden" : "";
	}

	private frameClicked(event: MouseEvent<HTMLElement>) {
		if (!(event.target as HTMLElement).closest(".modal-component__window")) {
			this.toggleShown(false);
		}
	}

	override render(): ReactNode {
		const HeaderType = this.props.titleHeaderLevel;

		const contentWrapperClasses = ["modal-component__content"];
		if (this.props.contentClass) {
			contentWrapperClasses.push(this.props.contentClass);
		}

		return (
			<section className={`modal-component${this.state.shown ? " modal-component--shown" : ""}`}>
				<button type="button"
					className="modal-component__open-button"
					onClick={this.toggleShown.bind(this, true)}>

					{this.props.openButtonText}
				</button>
				<div className="modal-component__frame"
					onClick={this.frameClicked.bind(this)}>
					<div className="modal-component__window">
						<div className="modal-component__header">
							<HeaderType className="modal-component__title">
								{this.props.title}
							</HeaderType>
							<button type="button"
								className="modal-component__close-button"
								onClick={this.toggleShown.bind(this, false)}>

								{this.props.closeButtonText || "Close"}
							</button>
						</div>
						<div className={contentWrapperClasses.join(" ")}>
							{this.props.children}
						</div>
					</div>
				</div>
			</section>
		);
	}
}
