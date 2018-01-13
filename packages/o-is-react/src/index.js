import oIs from 'o-is'
import React from 'react'
import PropTypes from 'prop-types'
import ConditionNode from './condition-node'

class ConditionBuilder extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			conditions: [{ type: 'equal' }]
		}
	}

	onChange(index, change) {
		const conditions = this.state.conditions.slice()
		conditions[index] = change
		this.setState({ conditions })
		this.props.onChange(conditions)
	}

	onAdd() {
		const conditions = this.state.conditions.slice()
		conditions.push({ type: 'equal' })
		this.setState({ conditions })
	}

	render() {
		return (
			<div>
				{this.state.conditions.map((condition, index) =>
					<ConditionNode onChange={this.onChange.bind(this, index)} condition={condition} schema={this.props.schema}/>)}
				<button onClick={this.onAdd.bind(this)}>Add</button>
			</div>
		)
	}
}

export default ConditionBuilder
