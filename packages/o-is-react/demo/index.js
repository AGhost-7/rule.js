import React from 'react'
import ReactDOM from 'react-dom'
import ConditionBuilder from '../src/index'
import superagent from 'superagent'

import oIsElasticsearch from 'o-is-elasticsearch'
import oIsModule from 'o-is'

const oIs = oIsModule.extend({}, {
	elasticsearch: oIsElasticsearch
})

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
		values: ['Canada', 'US', 'Germany']
	},
	{
		property: 'virtuoso',
		label: 'Virtuoso',
		type: 'boolean'
	},
	{
		property: 'occupation',
		label: 'Occupation',
		type: 'string'
	},
	{
		property: 'deceased',
		label: 'Deceased',
		type: 'boolean'
	}
]

class SearchResultRow extends React.Component {
	format(item, field) {
		if(field.type === 'boolean') {
			return item[field.property] ? 'Yes' : 'No'
		} else {
			return item[field.property]
		}
	}
	render() {
		return (
			<tr>
				{this.props.schema.map((field) =>
					<td>{this.format(this.props.item, field)}</td>)}
			</tr>
		)
	}
}

class SearchExample extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			items: []
		}
	}
	onSearch() {
		const filter = oIs(this.props.conditions).elasticsearch()
		superagent
			.post('http://localhost:9200/test/people/_search')
			.auth('elastic', 'changeme')
			.send({
				query: {
					bool: {
						filter
					}
				}
			})
			.then((res) => {
				const items = res.body.hits.hits.map((item) => item._source)
				this.setState({ items })
			})
			.catch((err) => {
				console.error(err)
			})
	}
	render() {
		return [
			<h3>Advanced search example</h3>,
			<p>For this example to work you will need to bring up elasticsearch. To
			do so, run the following command at the root of the o-is repository</p>,
			<pre>docker-compose up</pre>,
			<p>Afterwards run the test file in
			"packages/o-is-elasticsearch/test/common.test.js" to populate the
			index with data</p>,
			<table>
				<thead>
					<tr>
						{this.props.schema.map((field) =>
							<th>{field.label}</th>)}
					</tr>
				</thead>
				<tbody>
					{this.state.items.map((item) =>
						<SearchResultRow schema={this.props.schema} item={item}/>)}
				</tbody>
			</table>,
			<button onClick={this.onSearch.bind(this)}>Search!</button>
		]
	}
}

class Main extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			conditions: []
		}
	}
	onConditionChange(conditions) {
		console.log('onConditionChange:', JSON.stringify(conditions, null, 2))
		this.setState({ conditions })
	}
	render() {
		return (
			<div>
				<ConditionBuilder
						onChange={this.onConditionChange.bind(this)}
						schema={schema}/>
				<hr/>
				<SearchExample conditions={this.state.conditions} schema={schema}/>
			</div>
		)
	}
}

ReactDOM.render(
	<Main/>,
	document.getElementById('component')
)
