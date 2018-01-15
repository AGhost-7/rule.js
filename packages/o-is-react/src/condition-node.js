
import React from 'react'
import PropTypes from 'prop-types'

import EqualCondition from './condition/equal'
import EmptyCondition from './condition/empty'
import CompareCondition from './condition/compare'
import OrCondition from './condition/or'
import AndCondition from './condition/and'

const types = {
	equal: {
		translation: 'Equal',
		class: EqualCondition
	},
	//not: {
	//	translation: 'Not',
	//	class: NotPicker
	//},
	//if: 'If',
	//any: 'Any',
	null: {
		translation: 'Empty',
		class: EmptyCondition
	},
	propsEqual: {
		translation: 'Compare',
		class: CompareCondition
	},
	or: {
		translation: 'Or',
		class: OrCondition,
		types: {
			and: {
				translation: 'And',
				class: AndCondition
			}
		}
	}
	//gt: 'Greater Than',
	//lt: 'Less Than'
}

class ConditionNode extends React.Component {

	constructor(props) {
		super(props)
		this.types = types
	}

	onTypeChange(ev) {
		const condition = { type: ev.target.value }
		this.props.onChange(condition)
	}

	onConditionChange(change) {
		this.props.onChange(change)
	}

	render() {
		let Picker = null
		const types = this.types
		const condition = this.props.condition || { type: 'equal' }
		const type = condition.type
		if(type) {
			Picker = types[type].class
		}
		return (
			<div>
				<select value={type} onChange={this.onTypeChange.bind(this)}>
					{Object.keys(types).map((type) =>
							<option key={type} value={type}>{types[type].translation}</option>)}
				</select>
				{Picker && <Picker
					schema={this.props.schema}
					onChange={this.onConditionChange.bind(this)}
					condition={condition}
					ConditionNode={ConditionNode}/>}
			</div>
		)
	}
}

ConditionNode.propTypes = {
	schema: PropTypes.array.isRequired,
	onChange: PropTypes.func.isRequired
}

export default ConditionNode
