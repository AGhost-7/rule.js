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
					<td key="{field}">{this.format(this.props.item, field)}</td>)}
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
			.post('http://' + location.hostname + ':9200/test/people/_search')
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
			do so, run the following command at the root of the o-is repository:</p>,
			<pre>docker-compose up</pre>,
			<p>Afterwards run the test file in
			&quot;packages/o-is-elasticsearch/test/common.test.js&quot; to populate
			the index with data</p>,
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
			<br/>,
			<button className='btn btn-floating' onClick={this.onSearch.bind(this)}>
				<i className='material-icons'>search</i>
			</button>
		]
	}
}

class PersistanceExample extends React.Component {
	onClear() {
		delete localStorage.conditions
	}
	onLoad() {
		const conditions = JSON.parse(localStorage.conditions)
		this.props.onLoad(conditions)
	}
	onSave() {
		localStorage.conditions = JSON.stringify(this.props.conditions)
	}
	render() {
		return [
			<h3 className='row'>Persistance example</h3>,
			<p className='row'>Since the conditions are represented as json data, it is possible
				to persist the condition to local storage, etc.</p>,
			<div className='row'>
				<div className='col m2 offset-m3'>
					<a className='btn' onClick={this.onSave.bind(this)}>Save</a>
				</div>
				<div className='col m2'>
					<a className='btn' onClick={this.onClear.bind(this)}>Clear</a>
				</div>
				<div className='col m2'>
					<a className='btn' onClick={this.onLoad.bind(this)}>Load</a>
				</div>
			</div>
		]
	}
}

class Main extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			conditions: null
		}
	}
	onConditionChange(conditions) {
		console.log('onConditionChange:', JSON.stringify(conditions, null, 2))
		this.setState({ conditions })
	}
	onConditionLoad(conditions) {
		console.log('loading conditions', JSON.stringify(conditions, null, 2))
		this.setState({ conditions })
	}
	render() {
		return (
			<div>
				<ConditionBuilder
					onChange={this.onConditionChange.bind(this)}
					conditions={this.state.conditions}
					schema={schema}
				/>
				<hr/>
				<div className='row'>
					<SearchExample conditions={this.state.conditions} schema={schema}/>
				</div>
				<hr/>
				<PersistanceExample
					conditions={this.state.conditions}
					onLoad={this.onConditionLoad.bind(this)}
				/>
				<div className='row'>
					<div className="input-field col s12">
						<select>
							<option value="" disabled selected>Choose your option</option>
							<option value="1">Option 1</option>
							<option value="2">Option 2</option>
							<option value="3">Option 3</option>
						</select>
						<label>Materialize Select</label>
					</div>

				</div>

			</div>
		)
	}
}

ReactDOM.render(
	<Main/>,
	document.getElementById('root')
)
