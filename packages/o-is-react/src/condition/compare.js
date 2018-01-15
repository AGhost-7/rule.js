
import React from 'react'
import PropTypes from 'prop-types'
import FieldPicker from '../field-picker'

class CompareCondition extends React.Component {

	componentDidMount() {
		if(!this.props.condition.keys) this.props.onChange(this.condition())
	}

	condition() {
		const key = this.props.schema[0].property
		return {
			type: 'propsEqual',
			keys: this.props.condition.keys || [key, key]
		}
	}

	onFieldPicked(index, field) {
		const keys = this.condition().keys
		keys[index]= field.property
		const condition = {
			type: 'propsEqual',
			keys
		}
		this.props.onChange(condition)
	}

	render() {
		const condition = this.condition()
		return (
			<span>
				{condition.keys.map((key, index) =>
					<FieldPicker selected={key} onChange={this.onFieldPicked.bind(this, index)} schema={this.props.schema}/>)}
			</span>
		)
	}
}

export default CompareCondition
