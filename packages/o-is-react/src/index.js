import oIs from 'o-is'
import React from 'react'
import PropTypes from 'prop-types'
import ConditionNode from './condition-node'

class ConditionBuilder extends React.Component {

	onChange(index, conditions, change) {
		const update = conditions.slice()
		update[index] = change
		this.props.onChange(update)
	}

	onAdd(conditions) {
		this.props.onChange(conditions.concat({ type: 'equal' }))
	}

	render() {
		const conditions = this.props.conditions || [{ type: 'equal' }]
		return (
			<div>
				{conditions.map((condition, index) =>
					<ConditionNode
						onChange={this.onChange.bind(this, index, conditions)}
						condition={condition}
						schema={this.props.schema}/>)}
				<button onClick={this.onAdd.bind(this, conditions)}>Add</button>
			</div>
		)
	}
}

export default ConditionBuilder
