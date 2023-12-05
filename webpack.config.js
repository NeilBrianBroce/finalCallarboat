const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    watch: true,
    resolve: {
        fallback: {
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve("crypto-browserify")
        },
    },
};
