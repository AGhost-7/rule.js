const webpack = require('webpack')
const path = require('path')

module.exports = {
	entry: {
		app: path.join(__dirname, 'demo/index.js')
	},
	output: {
		path: path.join(__dirname, 'demo'),
		publicPath: '/assets/',
		filename: 'bundle.js'
	},
	devtool: 'eval-source-map',
	plugins: [
		new webpack.DefinePlugin({
			'process.env.BASE_URL': process.env.BASE_URL || 'localhost'
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	}
}
