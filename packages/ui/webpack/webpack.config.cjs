const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development",
    entry: './src/index.ts',
    output: {
        path: path.join(__dirname, '..', 'dist'),
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader'}
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: 'src/index.html', to: 'index.html'}
            ]
        })
    ],
    devtool: 'eval-source-map'
};
