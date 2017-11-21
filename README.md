# qe-namespace
## Qlik Engine Structs Documentation parser and class builder

### Project consists of two parts:
- Script for uploading and parsing [Qlik Engine API Structs Documentation](http://help.qlik.com/en-US/sense-developer/June2017/Subsystems/EngineAPI/Content/Structs/OverviewStruct.htm) into json files
- Script for generating namespace of JavaScript classes, that encapsulate JSON structure of Qlik Engine API data sets and provide some type cheking

### Installing

`npm install qe-namespace`

### Uploading and parsing Qlik Engine Documentation
 
```js
const qen = require("qe-namespace");
qen.loadStructs("September2017");
```

* Function `loadStructs(${version})` will extract struct list from [Struct Overview](http://help.qlik.com/en-US/sense-developer/September2017/Subsystems/EngineAPI/Content/Structs/OverviewStruct.htm) page
* Then each struct page will be parsed into `./lib/qlikDocs/${version}/structs/${structName}.json`
* At the end all structures are merged into `./lib/qlikDocs/${version}/structs.json`


Here is an example of some properties extracted from [HyperCubeDef](http://help.qlik.com/en-US/sense-developer/September2017/Subsystems/EngineAPI/Content/Structs/HyperCubeDef.htm) page and saved into [HyperCubeDef.json](https://github.com/inhalesulfur/qe-namespace/blob/master/lib/qlikDocs/September2017/structs/HyperCubeDef.json):
```json
{
    "qDimensions": {
        "desc": "Array of dimensions.",
        "class": "NxDimension",
        "type": "array"
    },
    "qMeasures": {
        "desc": "Array of measures.",
        "class": "NxMeasure",
        "type": "array"
    },
    "qInitialDataFetch": {
        "desc": "Initial data set.",
        "class": "NxPage",
        "type": "array"
    },
    "qMode": {
        "desc": "Defines the way the data are handled internally by the engine.\nDefault value is DATA_MODE_STRAIGHT.\nA pivot table can contain several dimensions and measures whereas a stacked pivot table can contain several dimensions but only one measure.\n",
        "values": {
            "S": "for straight table representation; DATA_MODE_STRAIGHT",
            "P": "for pivot table representation; DATA_MODE_PIVOT",
            "K": "for stacked table representation; DATA_MODE_PIVOT_STACK",
            "T": "for tree representation; DATA_MODE_TREE"
        },
        "type": "primitive"
    },
    "qSortbyYValue": {
        "desc": "To enable the sorting by ascending or descending order in the values of a measure. \nThis property applies to pivot tables and stacked pivot tables.\nIn the case of a pivot table, the measure or pseudo dimension should be defined as a top dimension. The sorting is restricted to the values of the first measure in a pivot table.\n",
        "values": {
            "0": "for no sorting",
            "1": "for sorting ascending",
            "-1": "for sorting descending"
        },
        "type": "primitive"
    }
}
```

Attributes `class` and `values` could be used for instance and possible value checking in setter functions.

### Building Qlik Engine Struct namespace

#### node.js case:
```js
const fs = require("fs");
const qen = require("qe-namespace");

var json = fs.readFileSync("./node_modules/qe-namespace/lib/qlikDocs/September2017/structs.json");
var n = qen.buildNamespace(json);
var hyperCubeDef = new n.HyperCubeDef;
```

#### require.js case:
```js
define([
    "text!structs.json",
    "qe-namespace"
], function(
    json,
    qen
){
    var n = qen.buildNamespace(json);
    var hyperCubeDef = new n.HyperCubeDef;
})
```

In this implementation each constructor adds to result object `.set` and `.init` collections for setting and initialisation functions. 
This collections are costructed with `Function` expression, so `JSON.parse` ingore them.
```js
var format = new st.FileDataFormat;
format.set("qType", "CSV")     //need to surf through documentation for possible properties
format.set.qType("CSV")        //no need to surf through documentation for possible properties
format.qType === "CSV" // true
```

For properties, which class presented in namespace, constructor adds initialisation function into `.init` collection:
```js
var dim = new st.NxDimension;
dim.init.qDef() // equal to dim.set.qDef(new st.NxInlineDimensionDef)
format.qDef instanseof NxInlineDimensionDef // true
```

Also setters check `instanceof` for setting value:
```js
dim.set.qDef({});
//TypeError: setted object is not an instance of the NxInlineDimensionDef
```

You can awoid `instanceof` checking by setting value directly to the property:
```js
dim.qDef = { qFieldDefs:[] };
```

If property has `values` attribute, setter will check for possible values:
```js
var format = new st.FileDataFormat;
format.set.qType("123")
/*
TypeError: wrong value setted. posible values:
{
    "CSV": "Delimited",
    "FIX": "Fixed Record",
    "DIF": "Data Interchange Format",
    "EXCEL_BIFF": "Microsoft Excel (XLS)",
    "EXCEL_OOXML": "Microsoft Excel (XLSX)",
    "HTMLfor HTML": "",
    "QVD": "QVD file",
    "XML": "XML",
    "QVX": "QVX file",
    "JSON": "JSON&nbsp;format",
    "KML": "KML file"
}
*/
```

Function `.push` for properties with `type:array` checks class of pushed value:
```js
var cube = new st.HyperCubeDef;
cube.qDimensions.push({})
//TypeError: pushed value is not an instance of the NxDimension
```

#### Stringify

Each constructor adds stringify function:
```js
this.stringify = JSON.stringify.bind(null, this);
```

#### Fluent interface

Functions from `.set` collection return initial object:
```js
var format = new st.FileDataFormat;
format.set.qType("CSV")
    .set.qComment("comment")
    .set.qCodePage("utf8")
```

Functions from `.init` collection return initialized object:
```js
var dim = new st.NxDimension;
var dimDef = dim.init.qDef();
```

Function `.push` for properties `type:array` returns initial array:
```js
var cube = new st.HyperCubeDef;
cube.qDimensions.push(new st.NxDimension)
    .push(new st.NxDimension)
    .push(new st.NxDimension);
```

If array items class presented in namespace, method `.pushNew` added. This method returns pushed object:
```js
var cube = new st.HyperCubeDef;
cube.qInitialDataFetch.pushNew()
    .set.qLeft(0)
    .set.qTop(0)
    .set.qWidth(4)
    .set.qHeight(50);
cube.qDimensions.pushNew()
    .init.qDef()
        .qFieldDefs
            .push("field1")
            .push("field2")
            .push("field3")
            .push("field4");
console.log(cube.stringify(null, 4));        
```

Console:
```json
{
    "qDimensions": [
        {
            "qAttributeExpressions": [],
            "qAttributeDimensions": [],
            "qDef": {
                "qFieldDefs": [
                    "field1",
                    "field2",
                    "field3",
                    "field4"
                ],
                "qFieldLabels": [],
                "qSortCriterias": [],
                "qNumberPresentations": []
            }
        }
    ],
    "qMeasures": [],
    "qInterColumnSortOrder": [],
    "qInitialDataFetch": [
        {
            "qLeft": 0,
            "qTop": 0,
            "qWidth": 4,
            "qHeight": 50
        }
    ]
}
```