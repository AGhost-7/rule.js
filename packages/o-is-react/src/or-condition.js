
import React from 'react'
import PropTypes from 'prop-types'


class OrCondition extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			condition: {
				type: 'or',
				tests: props.condition.tests || [{
					type: 'equal'
				}]
			}
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.condition.tests.length !== nextState.condition.tests.length
	}

	onNodeChange(index, conditionChange) {
		const tests = this.state.condition.tests.slice()
		tests[index] = conditionChange
		const condition = {
			type: 'or',
			tests
		}
		this.props.onChange(condition)
		this.setState({ condition })
	}

	onAdd() {
		const tests = this.state.condition.tests.concat({ type: 'equal' })
		const condition = {
			type: 'or',
			tests
		}
		this.props.onChange(condition)
		this.setState({ condition })
	}

	render() {
		const style = { 'padding-left': '15px' }
		const ConditionNode = this.props.ConditionNode
		class OrConditionNode extends ConditionNode {
			constructor(props) {
				super(props)
				this.types = Object.assign({}, this.types, this.types.or.types)
			}
		}
		return (
			<div style={style}>
				{this.state.condition.tests.map((test, index) =>
					<OrConditionNode
						schema={this.props.schema}
						condition={test}
						ConditionNode={ConditionNode}
						onChange={this.onNodeChange.bind(this, index)}/>)}
				<button onClick={this.onAdd.bind(this)}>Add</button>
			</div>
		)
	}
}

export default OrCondition
