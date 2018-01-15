
import React from 'react'
import PropTypes from 'prop-types'


class OrCondition extends React.Component {

	condition() {
		return {
			type: 'or',
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
		const style = { 'paddingLeft': '15px' }
		const ConditionNode = this.props.ConditionNode
		class OrConditionNode extends ConditionNode {
			constructor(props) {
				super(props)
				this.types = Object.assign({}, this.types, this.types.or.types)
			}
		}
		const condition = this.condition()
		return (
			<div style={style}>
				{condition.tests.map((test, index) =>
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
