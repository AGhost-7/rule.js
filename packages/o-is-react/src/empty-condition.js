
import React from 'react'
import PropTypes from 'prop-types'

import FieldPicker from './field-picker'

class EmptyCondition extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			condition: {
				type: 'null',
				key: this.props.condition.key || this.props.schema[0].property
			}
		}
	}

	componentDidMount() {
		if(!this.props.condition.key) this.props.onChange(this.state.condition)
	}

	onFieldPicked(field) {
		const condition = {
			type: 'null',
			key: field.property
		}
			
		this.setState({ condition })
		this.props.onChange(condition)
	}

	render() {
		return <FieldPicker onChange={this.onFieldPicked.bind(this)} schema={this.props.schema}/>
	}

}

EmptyCondition.propTypes = {
	onChange: PropTypes.func.isRequired,
	schema: PropTypes.array.isRequired
}

export default EmptyCondition
