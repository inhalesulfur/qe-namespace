
var fs = require("fs-extra");
var builder = require("../lib/index");

//var json = fs.readFileSync("./lib/qlikDocs/September2017/structs.json");
var json = fs.readFileSync("./lib/qlikDocs/3.1/structs.json");
var st = builder.buildNamespace(json);

var cube = new st.HyperCubeDef;
cube.qInitialDataFetch.pushNew()
	.set.qLeft(0)
	.set.qTop(0)
	.set.qWidth(4)
	.set.qHeight(50);
cube.qDimensions.pushNew()
	.init.qDef()
		.qFieldDefs.push("field1")
			.push("field2")
			.push("field3")
			.push("field4");
console.log(cube.stringify(null, 4));

var format = new st.FileDataFormat;
format.set.qType("CSV")
	.set.qComment("comment")
	.set.qCodePage("utf8")


console.log(format.stringify());