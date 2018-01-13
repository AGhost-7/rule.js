import React from 'react'
import PropTypes from 'prop-types'

class FieldPicker extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			selected: props.selected
		}
	}

	onFieldPicked(event) {
		const selected = event.target.value
		if(this.props.onChange) {
			const field = this.props.schema.find((field) =>
				field.property === selected)
			this.props.onChange(field)
		}
		this.setState({ selected })
	}

	render() {
		return (
			<select value={this.state.selected} onChange={this.onFieldPicked.bind(this)}>
				{this.props.schema.map((field) => 
					<option key={field.property} value={field.property}>
						{field.label}
					</option>)}
			</select>
		)
	}

}

FieldPicker.propTypes = {
	onChange: PropTypes.func,
	schema: PropTypes.array.isRequired,
	selected: PropTypes.string
}

export default FieldPicker
