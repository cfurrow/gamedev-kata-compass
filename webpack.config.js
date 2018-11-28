"use strict";

var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: {
    app: [path.resolve(__dirname, "src/main.js")],
    vendor: ["phaser"]
  },
  watch: true,
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, "dist"),
    publicPath: "./dist/",
    filename: "[name].js" //"[name].[contenthash].js"
  },
}
