
import React from 'react'
import PropTypes from 'prop-types'


class OrCondition extends React.Component {

	constructor(props) {
		super(props)
		class OrConditionNode extends this.props.ConditionNode {
			constructor(props) {
				super(props)
				this.types = Object.assign({}, this.types, this.types.or.types)
			}
		}
		this.ConditionNode = OrConditionNode
	}

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
		const OrConditionNode = this.ConditionNode
		const ConditionNode = this.props.ConditionNode
		const condition = this.condition()
		return (
			<div style={style}>
				{condition.tests.map((test, index) =>
					<OrConditionNode
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

OrCondition.propTypes = {
	ConditionNode: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	condition: PropTypes.object,
	schema: PropTypes.array.isRequired
}

export default OrCondition
