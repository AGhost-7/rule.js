
import React from 'react'
import PropTypes from 'prop-types'
import FieldPicker from './field-picker'

class CompareCondition extends React.Component {
	constructor(props) {
		super(props)
		const key = props.schema[0].property
		this.state = { 
			condition: { type: 'propsEqual' }
		}
		this.state.condition.keys = props.condition.keys || [key, key]
	}

	componentDidMount() {
		if(!this.props.condition.keys) this.props.onChange(this.state.condition)
	}

	onFieldPicked(index, field) {
		const keys = this.state.condition.keys.slice()
		keys[index]= field.property
		const condition = {
			type: 'propsEqual',
			keys
		}
		this.setState({ condition })
		this.props.onChange(condition)
	}

	render() {
		return (
			<span>
				{this.state.condition.keys.map((key, index) =>
					<FieldPicker selected={key} onChange={this.onFieldPicked.bind(this, index)} schema={this.props.schema}/>)}
			</span>
		)
	}
}

export default CompareCondition
