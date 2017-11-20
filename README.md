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

* Function `loadStructs(${version})` will extract struct list from [Struct Overview](http://help.qlik.com/en-US/sense-developer/September2017/Subsystems/EngineAPI/Content/Structs/OverviewStruct.htm) page from Qlik Engine API Documentation
* Then each struct page will be parsed into `./lib/qlikDocs/${version}/structs/${structName}.json`
* At the end all structures are merged into `./lib/qlikDocs/${version}/structs.json`


Here is an example of some attributes extracted from [HyperCubeDef Page](http://help.qlik.com/en-US/sense-developer/September2017/Subsystems/EngineAPI/Content/Structs/HyperCubeDef.htm) and saved into HyperCubeDef.json
```json
{
    "qDimensions": {
        "desc": "Array of dimensions.",
        "instance": "NxDimension",
        "type": "array"
    },
    "qMeasures": {
        "desc": "Array of measures.",
        "instance": "NxMeasure",
        "type": "array"
    },
    "qInitialDataFetch": {
        "desc": "Initial data set.",
        "instance": "NxPage",
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
	...
}
```