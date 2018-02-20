
/**
 * Text input component which only updates when the focus
 * is lost.
 */

import React from 'react'
import PropTypes from 'prop-types'

class TextInput extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			value: this.props.value || '',
			prevValue: null
		}
	}

	componentWillReceiveProps({value}) {
		this.setState({ value })
	}

	onBlur() {
		if(this.props.onChange) {
			if(this.state.prevValue !== this.state.value) {
				this.props.onChange(this.state.value)
			}
		}
	}

	onChange(ev) {
		const value = ev.target.value
		this.setState((prevState) => {
			return {
				value,
				prevValue: prevState.value
			}
		})
	}

	render() {
		return (
			<input
				type="text"
				onChange={this.onChange.bind(this)}
				onBlur={this.onBlur.bind(this)}
				value={this.state.value}
			/>
		)
	}

}

TextInput.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired
}

export default TextInput
