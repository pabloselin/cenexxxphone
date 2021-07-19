var CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
    entry: "./src/index.js",
    mode: "development",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/assets/html", to: "html" },
                { from: "src/assets/images", to: "images" },
                { from: "src/assets/videos", to: "videos" },
                { from: "src/assets/sounds", to: "sounds" },
            ],
        }),
    ],
};
