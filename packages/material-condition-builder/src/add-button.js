import React from 'react'

export default function button({onClick}) {
	return (
		<a className="btn-floating waves-effect waves-light red" onClick={onClick}>
			<i className="material-icons">add</i>
		</a>
	)
}
