import React from 'react'
import PropTypes from 'prop-types'
import FieldPicker from '../field-picker'
import TextInput from '../text-input'

class EqualCondition extends React.Component {

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

	onStringChanged(value) {
		this.onValueChanged(value)
	}
	onEnumChanged(event) {
		this.onValueChanged(event.target.value)
	}
	onBooleanChanged(event) {
		this.onValueChanged(event.target.checked)
	}

	onValueChanged(value) {
		const key = this.key()
		const field = this.findField(key)
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
				return <TextInput value={condition.value} onChange={this.onStringChanged.bind(this)}/>
		case 'enum':
				return (
					<select
							class='ois-dropdown'
							value={condition.value}
							onChange={this.onEnumChanged.bind(this)}>
						{field.values.map((value) =>
							<option key={value} value={value}>{value}</option>)}
					</select>
				)
		case 'boolean':
				return <input
						type="checkbox"
						checked={condition.value}
						onChange={this.onBooleanChanged.bind(this)}/>
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
