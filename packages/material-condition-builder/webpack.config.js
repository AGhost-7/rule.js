const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')

module.exports = {
	entry: [
		path.join(__dirname, 'demo/index.js'),
		path.join(__dirname, 'src/style/index.scss')
	],
	output: {
		filename: 'assets/bundle.js'
	},
	devtool: 'eval-source-map',
	plugins: [
		new ExtractTextPlugin({
			filename: 'assets/bundle.css',
			allChunks: true
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
			},
			{
				test: /\.scss/,
				include: path.resolve('./src/style'),
				use: ExtractTextPlugin.extract({
					use: ['css-loader', 'sass-loader']
				})
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'url-loader?limit=10000&mimetype=application/font-woff'
			}
		]
	}
}
