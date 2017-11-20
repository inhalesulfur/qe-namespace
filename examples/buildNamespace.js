
var fs = require("fs-extra");
var builder = require("../lib/index");

//var json = fs.readFileSync("./lib/qlikDocs/September2017/structs.json");
var json = fs.readFileSync("./lib/qlikDocs/3.1/structs.json");
var st = builder.buildNamespace(json);

var cube = new st.HyperCubeDef;
var dim = cube.qDimensions.push();

dim.init.qDef().qFieldDefs.push("field_expression");
console.log(dim.stringify());
console.log(cube.stringify());

var format = new st.FileDataFormat;
format.set.qType("CSV")
	.set.qLabel("embedded labels")
	.set.qQuote("MSQ")
	//.set.qDelimiter()
	.init.qDelimiter();
console.log(format.stringify());