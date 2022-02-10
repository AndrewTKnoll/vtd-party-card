import React, { Component, ReactNode } from "react";

let activeTimers: TimerComponent[] = [];
let timeoutId: number | undefined = undefined;

function updateTimers() {
	const now = new Date();
	timeoutId = window.setTimeout(updateTimers, 1000 - now.getTime() % 1000);

	activeTimers.forEach((timer) => {
		timer.setState({
			now: now
		});
	});
}

function registerTimer(newTimer: TimerComponent) {
	activeTimers.push(newTimer);
	if (!timeoutId) {
		updateTimers();
	}
}

function unregisterTimer(oldTimer: TimerComponent) {
	activeTimers = activeTimers.filter((timer) => {
		return timer !== oldTimer;
	});
	if (activeTimers.length === 0 && timeoutId) {
		clearTimeout(timeoutId);
		timeoutId = undefined;
	}
}

interface TimerComponentProps {
	targetDate: Date;
	hours?: boolean;
	afterTimeText?: string;
	prefixText?: string;
	suffixText?: string;
}
interface TimerComponentState {
	now: Date;
}

export class TimerComponent extends Component<TimerComponentProps, TimerComponentState> {

	constructor(props: TimerComponentProps) {
		super(props);

		this.state = {
			now: new Date()
		};
	}

	override componentDidMount() {
		registerTimer(this);
	}

	override componentWillUnmount() {
		unregisterTimer(this);
	}

	private renderTimerText(): ReactNode {
		if (this.props.targetDate < this.state.now && this.props.afterTimeText) {
			return (
				<span className="timer__text">
					{this.props.afterTimeText}
				</span>
			);
		}

		const interval = Math.floor(Math.abs(this.props.targetDate.getTime() - this.state.now.getTime()) / 1000);

		const seconds = interval % 60;
		let minutes = Math.floor(interval / 60);

		if (!this.props.hours) {
			return (
				<span className="timer__interval">
					{`${minutes}:${seconds > 9 ? "" : "0"}${seconds}`}
				</span>
			);
		}

		minutes = minutes % 60;
		const hours = Math.floor(interval / 60 / 60);

		return (
			<span className="timer__interval">
				{`${hours}:${minutes > 9 ? "" : "0"}${minutes}:${seconds > 9 ? "" : "0"}${seconds}`}
			</span>
		);
	}

	override render(): ReactNode {
		return (
			<div className="timer">
				{this.props.prefixText !== undefined &&
					<span className="timer__prefix">
						{this.props.prefixText}
					</span>
				}
				{this.renderTimerText()}
				{this.props.suffixText !== undefined &&
					<span className="timer__suffix">
						{this.props.suffixText}
					</span>
				}
			</div>
		);
	}
}
