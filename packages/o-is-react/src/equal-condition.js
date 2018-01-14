import React from 'react'
import PropTypes from 'prop-types'
import FieldPicker from './field-picker'

class EqualCondition extends React.Component {

	//constructor(props) {
	//	super(props)
	//	this.state = {
	//		condition: {
	//			type: 'equal',
	//			key: props.condition.key || props.schema[0].property,
	//			value: props.condition.value
	//		}
	//	}
	//	if(typeof props.condition.value === 'undefined') {
	//		this.state.condition.value = this.defaultValue(this.state.condition.key)
	//	}
	//}

	defaultValue(key) {
		const field = this.findField(key)
		if(field.type === 'enum') {
			return field.values[0]
		} else if(field.type === 'boolean') {
			return false
		} else {
			return ''
		}
	}

	key() {
		return this.props.condition.key || this.props.schema[0].property
	}

	condition() {
		const key = this.key()

		return {
			type: 'equal',
			value: typeof this.props.condition.value === 'undefined'
				? this.defaultValue(key)
				: this.props.condition.value,
			key
		}
	}

	componentDidMount() {
		if(typeof this.props.condition.key === 'undefined' ||
					typeof this.props.condition.value === 'undefined') {
			this.props.onChange(this.condition())
		}
	}

	findField(property) {
		return this.props.schema.find((field) => field.property === property)
	}

	onFieldPicked(field) {
		const key = field.property
		let value = this.defaultValue(key)
		const condition = { type: 'equal', key, value }
		this.props.onChange(condition)
	}

	onValuePicked(event) {
		const key = this.key()
		const field = this.findField(key)
		const value = field.type === 'boolean'
			? event.target.checked
			: event.target.value
		const condition = {
			type: 'equal',
			key,
			value
		}
		this.props.onChange(condition)
	}

	renderValuePicker() {
		const condition = this.condition()
		const field = this.findField(condition.key)
		switch(field.type) {
		case 'string':
				return <input
						value={condition.value}
						type="text"
						onChange={this.onValuePicked.bind(this)}/>
		case 'enum':
				return (
					<select
							value={condition.value}
							onChange={this.onValuePicked.bind(this)}>
						{field.values.map((value) =>
							<option key={value} value={value}>{value}</option>)}
					</select>
				)
		case 'boolean':
				return <input
						type="checkbox"
						checked={condition.value}
						onChange={this.onValuePicked.bind(this)}/>
		}
	}

	render() {
		return (
			<span>
				<FieldPicker
						selected={this.key()}
						onChange={this.onFieldPicked.bind(this)}
						schema={this.props.schema}/>
				{this.renderValuePicker()}
			</span>
		)
	}
}

EqualCondition.propTypes = {
	schema: PropTypes.array.isRequired,
	onChange: PropTypes.func.isRequired
}

export default EqualCondition
