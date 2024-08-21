const path = require("path");
const fs = require("fs");
const webpack = require('webpack'); // Import webpack
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

const dotenv = require('dotenv');

// Load environment variables from custom file
dotenv.config({ path: path.resolve(__dirname, 'environment.env') });

module.exports = {
    entry: path.resolve(appDirectory, "src/app.ts"), //path to the main .ts file
    output: {
        filename: "js/AiAvatarLib.js", //name for the js file that is created/compiled in memory
        clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
        host: "0.0.0.0",
        port: 8080, //port that we're using for local host (localhost:8080)
        static: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
        hot: true,
        devMiddleware: {
            publicPath: "/",
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },           
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }),
        new webpack.DefinePlugin({
            'process.env': {
                AZURE_SUBSCRIPTION_KEY: JSON.stringify(process.env.AZURE_SUBSCRIPTION_KEY),
                AZURE_REGION: JSON.stringify(process.env.AZURE_REGION),
            }
        })
    ],
    mode: "development",
};