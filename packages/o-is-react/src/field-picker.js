import React from 'react'
import PropTypes from 'prop-types'

class FieldPicker extends React.Component {

	onFieldPicked(event) {
		const selected = event.target.value
		const field = this.props.schema.find((field) =>
			field.property === selected)
		this.props.onChange(field)
	}

	render() {
		return (
			<select class='ois-dropdown' value={this.props.selected} onChange={this.onFieldPicked.bind(this)}>
				{this.props.schema.map((field) => 
					<option key={field.property} value={field.property}>
						{field.label}
					</option>)}
			</select>
		)
	}

}

FieldPicker.propTypes = {
	onChange: PropTypes.func.isRequired,
	schema: PropTypes.array.isRequired,
	selected: PropTypes.string
}

export default FieldPicker
