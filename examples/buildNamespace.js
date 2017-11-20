var builder = require("../lib/namespaceBuilder");
var fs = require("fs-extra");

var json = fs.readFileSync("./lib/qlikDocs/September2017/structs.json");
var nm = builder.buildNamespace(json);

var cube = new nm.HyperCubeDef;
console.log(cube);