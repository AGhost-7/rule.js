
/**
 * Text input component which only updates when the focus
 * is lost.
 */

import React from 'react'

class TextInput extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			value: this.props.value || ''
		}
		this.state.prevValue = this.state.value
	}

	componentWillReceiveProps({value}) {
		this.setState({ value })
	}

	onBlur() {
		if(this.props.onChange) {
			if(this.state.prevValue !== this.state.value) {
				this.props.onChange(this.state.value)
				this.state.prevValue = this.state.value
			}
		}
	}

	onChange(ev) {
		this.setState({ value: ev.target.value })
	}

	render() {
		return <input
				type="text"
				onChange={this.onChange.bind(this)}
				onBlur={this.onBlur.bind(this)}
				value={this.state.value}/>
	}

}

export default TextInput
