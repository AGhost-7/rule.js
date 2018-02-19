
import React from 'react'
import PropTypes from 'prop-types'

import FieldPicker from '../field-picker'

class EmptyCondition extends React.Component {

	componentDidMount() {
		if(!this.props.condition.key) {
			const condition = {
				type: 'null',
				key: this.selected()
			}
			this.props.onChange(condition)
		}
	}

	onFieldPicked(field) {
		const condition = {
			type: 'null',
			key: field.property
		}
		this.props.onChange(condition)
	}

	selected() {
		return this.props.condition.key || this.props.schema[0].property
	}

	render() {
		return (
			<FieldPicker
				onChange={this.onFieldPicked.bind(this)}
				selected={this.selected()}
				schema={this.props.schema}
			/>
		)
	}

}

EmptyCondition.propTypes = {
	onChange: PropTypes.func.isRequired,
	schema: PropTypes.array.isRequired,
	condition: PropTypes.object
}

export default EmptyCondition
