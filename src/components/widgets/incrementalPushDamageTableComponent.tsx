import React, { Component, ReactNode } from "react";

interface IncrementalPushDamageTableComponentProps {
	totalPushDamage: number;
	damageIncrementAmount: number;
	damageType?: string | undefined;
	maxGuessCount: number;
	currentGuessCount: number;
	updateGuessCount: (count: number) => void;
}

export class IncrementalPushDamageTableComponent extends Component<IncrementalPushDamageTableComponentProps> {

	private incrementGuessCount() {
		if (this.props.currentGuessCount <= this.props.maxGuessCount) {
			this.props.updateGuessCount(this.props.currentGuessCount + 1);
		}
	}

	private decrementGuessCount() {
		if (this.props.currentGuessCount > 0) {
			this.props.updateGuessCount(this.props.currentGuessCount - 1);
		}
	}

	private formatDamageAmount(amount: number): string {
		if (amount <= 0) {
			return "0";
		}
		return this.props.damageType ? `${amount} ${this.props.damageType}` : `${amount}`;
	}

	override render(): ReactNode {
		return <>
			<table className="info-table">
				<thead>
					<tr>
						<th>Wrong Guess</th>
						<th>Wrong Guess Damage</th>
						<th>Push Taken on Total Failure</th>
					</tr>
				</thead>
				<tbody>
					<tr className={this.props.currentGuessCount === 0 ? "info-table__active" : undefined}>
						<td>0</td>
						<td>n/a</td>
						<td>{this.formatDamageAmount(this.props.totalPushDamage)}</td>
					</tr>
					{Array(this.props.maxGuessCount).fill(0).map((_, index) => {
						return <tr key={index}
							className={this.props.currentGuessCount === (index + 1) ? "info-table__active" : undefined}>

							<td>{addOrdinalSuffix(index + 1)}</td>
							<td>{this.formatDamageAmount(this.props.damageIncrementAmount)}</td>
							<td>{this.formatDamageAmount(this.props.totalPushDamage - (this.props.damageIncrementAmount * (index + 1)))}</td>
						</tr>;
					})}
					<tr className={this.props.currentGuessCount > this.props.maxGuessCount ? "info-table__active" : undefined}>
						<td>{`${addOrdinalSuffix(this.props.maxGuessCount + 1)}+`}</td>
						<td>0</td>
						<td>{this.formatDamageAmount(this.props.totalPushDamage - (this.props.damageIncrementAmount * this.props.maxGuessCount))}</td>
					</tr>
				</tbody>
			</table>
			<div className="room-component__control-row row">
				<button type="button"
					onClick={this.incrementGuessCount.bind(this)}>

					Wrong Guess
				</button>
				<button type="button"
					onClick={this.decrementGuessCount.bind(this)}>

					Undo
				</button>
			</div>
		</>;
	}
}

function addOrdinalSuffix(number: number): string {
	if (number > 10 && number < 14) {
		return `${number}th`;
	}

	if (number === 0) {
		return "0"
	}

	if (number % 10 === 1) {
		return `${number}st`;
	}

	if (number % 10 === 2) {
		return `${number}nd`;
	}

	if (number % 10 === 3) {
		return `${number}rd`;
	}

	return `${number}th`;
}
