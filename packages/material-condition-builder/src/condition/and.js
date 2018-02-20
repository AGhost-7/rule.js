
import React from 'react'
import PropTypes from 'prop-types'

class AndCondition extends React.Component {

	condition() {
		return {
			type: 'and',
			tests: this.props.condition.tests || [{ type: 'equal' }]
		}
	}

	onNodeChange(index, conditionChange) {
		const condition = this.condition()
		condition.tests[index] = conditionChange
		this.props.onChange(condition)
	}

	onAdd() {
		const condition = this.condition()
		condition.tests.push({ type: 'equal' })
		this.props.onChange(condition)
	}

	render() {
		const ConditionNode = this.props.ConditionNode
		return (
			<div>
				{this.condition().tests.map((test, index) =>
					<ConditionNode
						schema={this.props.schema}
						condition={test}
						ConditionNode={ConditionNode}
						onChange={this.onNodeChange.bind(this, index)}
					/>)}
				<button onClick={this.onAdd.bind(this)}>Add</button>
			</div>
		)
	}
}

AndCondition.propTypes = {
	schema: PropTypes.array.isRequired,
	onChange: PropTypes.func.isRequired,
	condition: PropTypes.array
}

export default AndCondition
