
var fs = require("fs-extra");
var builder = require("../lib/index");

var json = fs.readFileSync("./lib/qlikDocs/3.1/structs.json");
var st = builder.buildNamespace(json);

var instances = {};
each.call(st, function(item, key){
	console.log("\n");
	console.log("Init "+ key);
	instances[key] = new item;
	var first = true;
	each.call(instances[key].set, function(setter, key){
		if (first) {
			first = false;
			console.log("Checking setters");
		}
		console.log(setter);
		if (setter.instanseOf){
			setter(new setter.instanseOf);
		}
		else if (setter.values){
			each.call(setter.values, function(value, key){
				setter(key);
			})
		}
	})
	first = true;
	each.call(instances[key].init, function(initter, key){
		if (first) {
			first = false;
			console.log("Checking initters");
		}
		console.log(initter);
		initter();
	})
	
	console.log("Checking stringify");
	console.log(instances[key].stringify());
})
function each(callback){
	for (var i in this){
		if (this.hasOwnProperty(i)){
			if (callback.call(this, this[i], i) == "break") break;
		}
	}
}

/*
var cube = new st.HyperCubeDef;
var dim = cube.qDimensions.push();

dim.init.qDef().qFieldDefs.push("field_expression");
console.log(dim);

var format = new st.FileDataFormat;
format.set.qType("CSV")
	.set.qLabel("embedded labels")
	.set.qQuote("MSQ")
	.set.qDelimiter()
	.init.qDelimiter();
console.log(JSON.stringify(format));*/