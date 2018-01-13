
import React from 'react'
import PropTypes from 'prop-types'

import EqualCondition from './equal-condition'
import EmptyCondition from './empty-condition'
import CompareCondition from './compare-condition'

const types = {
	equal: {
		translation: 'Equal',
		class: EqualCondition
	},
	//not: {
	//	translation: 'Not',
	//	class: NotPicker
	//},
	//and: 'And',
	//or: 'Or',
	//if: 'If',
	//any: 'Any',
	//notEqual: 'Not Equal',
	//propsEqual: 'Properties Equal',
	null: {
		translation: 'Empty',
		class: EmptyCondition
	},
	propsEqual: {
		translation: 'Compare',
		class: CompareCondition
	},
	//true: 'True',
	//false: 'False',
	//gt: 'Greater Than',
	//lt: 'Less Than'
}

class ConditionNode extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			condition: props.condition || { type: 'equal' }
		}
		this.types = types
	}

	onTypeChange(ev) {
		const condition = { type: ev.target.value }
		this.setState({ condition })
		this.props.onChange(condition)
	}

	onConditionChange(change) {
		this.setState({
			condition: change
		})
		this.props.onChange(change)
	}

	render() {
		let Picker = null
		const types = this.types
		if(this.state.condition.type) {
			Picker = types[this.state.condition.type].class
		}
		return (
			<div>
				<select onChange={this.onTypeChange.bind(this)}>
					{Object.keys(types).map((type) =>
							<option value={type}>{types[type].translation}</option>)}
				</select>
				{Picker && <Picker
					schema={this.props.schema}
					onChange={this.onConditionChange.bind(this)}
					condition={this.state.condition}
					params={this.state.params}/>}
			</div>
		)
	}
}

ConditionNode.propTypes = {
	schema: PropTypes.array.isRequired,
	onChange: PropTypes.func.isRequired
}

export default ConditionNode
