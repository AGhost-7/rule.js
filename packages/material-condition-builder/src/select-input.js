import PropTypes from 'prop-types'
import React from 'react'

class SelectInput extends React.Component {

	constructor() {
		super()
		this._onRef = this.onRef.bind(this)
		this._onChange = this.onChange.bind(this)
	}

	onRef(ref) {
		this.select = ref
		/* global $:true */
		this.$select = $(ref)
	}

	onChange(ev) {
		this.props.onChange(ev)
	}

	componentDidMount() {
		this.$select.material_select()
		this.$select.on('change', this._onChange)
	}

	componentWillUnmount() {
		this.$select.off('change', this._onChange)
	}

	render() {
		return (
			<select ref={this._onRef}>
				{this.props.children}
			</select>
		)
	}

}

SelectInput.propTypes = {
	onChange: PropTypes.func.isRequired,
	value: PropTypes.string
}

export default SelectInput
