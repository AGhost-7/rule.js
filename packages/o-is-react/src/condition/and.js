
import React from 'react'
import PropTypes from 'prop-types'

import ConditionNode from '../condition-node'

class AndCondition extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			condition: {
				type: 'and',
				tests: props.condition.tests || [{
					type: 'equal'
				}]
			}
		}
	}
	onNodeChange(index, conditionChange) {
		const tests = this.state.condition.tests.slice()
		tests[index] = conditionChange
		const condition = {
			type: 'and',
			tests
		}
		this.props.onChange(condition)
		this.setState({ condition })
	}

	onAdd() {
		const tests = this.state.condition.tests.concat({ type: 'equal' })
		const condition = {
			type: 'and',
			tests
		}
		this.props.onChange(condition)
		this.setState({ condition })
	}

	render() {
		const style = { paddingLeft: '15px' }
		return (
			<div style={style}>
				{this.state.condition.tests.map((test, index) =>
					<ConditionNode
						schema={this.props.schema}
						condition={test}
						ConditionNode={this.props.ConditionNode}
						onChange={this.onNodeChange.bind(this, index)}/>)}
				<button onClick={this.onAdd.bind(this)}>Add</button>
			</div>
		)
	}
}

export default AndCondition
