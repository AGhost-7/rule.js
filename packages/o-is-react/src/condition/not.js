import React from 'react'
import PropTypes from 'prop-types'

class NotCondition extends React.Component {

	constructor(props) {
		super(props)
		class NotConditionNode extends this.props.ConditionNode {
			constructor(props) {
				super(props)
				this.types = Object.assign({}, this.types, this.types.not.types)
			}
		}
		this.ConditionNode = NotConditionNode
	}

	condition() {
		return {
			type: 'not',
			args: this.props.condition.args || { type: 'equal' }
		}
	}

	onNodeChange(changed) {
		this.props.onChange({
			type: 'not',
			args: changed
		})
	}

	render() {
		const ConditionNode = this.ConditionNode
		const style = { paddingLeft: '15px' }
		return (
			<div style={style}>
				<ConditionNode
						schema={this.props.schema}
						condition={this.condition().args}
						ConditionNode={this.props.ConditionNode}
						onChange={this.onNodeChange.bind(this)}/>
			</div>
		)
	}
}

NotCondition.propTypes = {
	condition: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	schema: PropTypes.array.isRequired,
	ConditionNode: PropTypes.func.isRequired
}

export default NotCondition
