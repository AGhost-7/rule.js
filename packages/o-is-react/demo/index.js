import React from 'react'
import ReactDOM from 'react-dom'
import ConditionBuilder from '../src/index'

const onChange = (condition) => {
	console.log('change:', JSON.stringify(condition, null, 2))
}

const schema = [
	{
		property: 'firstName',
		label: 'First Name',
		type: 'string'
	},
	{
		property: 'lastName',
		label: 'Last Name',
		type: 'string'
	},
	{
		property: 'country',
		label: 'Country',
		type: 'enum',
		values: ['Canada', 'US']
	},
	{
		property: 'married',
		label: 'Married',
		type: 'boolean'
	}
]

ReactDOM.render(
	<ConditionBuilder onChange={onChange} schema={schema}/>,
	document.getElementById('component')
)
