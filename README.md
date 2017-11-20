# qe-namespace
## Qlik Engine Structs Documentation parser and class builder

### Project consists of two part:
- Script for uploading and parsing [Qlik Engine API Structs Documentation](http://help.qlik.com/en-US/sense-developer/June2017/Subsystems/EngineAPI/Content/Structs/OverviewStruct.htm) into json files
- Script for generating namespace of JavaScript classes, that encapsulate JSON structure of Qlik Engine API data sets and provide some type cheking

### Installing

`npm install qe-namespace`

### Uploading and parsing Qlik Engine Documentation

 
```js
const qen = require("qe-namespace");
qen.loadStructs("September2017");
```

Function `loadStructs(${version})` will extract struct list from [Struct Overview](http://help.qlik.com/en-US/sense-developer/September2017/Subsystems/EngineAPI/Content/Structs/OverviewStruct.htm) page from Qlik Engine API Documentation
Then each struct page will be parsed into `./lib/qlikDocs/${version}/structs/${structName}.json`
Finally all structs concated into `./lib/qlikDocs/${version}/structs.json`

