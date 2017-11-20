module.exports.loadStructs = loadQlikEngineStructs;
const http = require("http");
const jsdom = require('jsdom');
const d3 = require('d3');
const fs = require('fs-extra');
const path = require('path');

const antiHtml = /(<([^>]+)>)/g;
const antiSpace = /  /g;
const antiN = /\n/g;
const antiStartN = /^\n/g;
const antiEndComma = /,$/g;
const regOneOf = /One of/g;
const regArrayOf = /Array of/g;

function loadQlikEngineStructs(version){
	var structsMap = {};
	var totalPages = 0;
	var loadedPages = 0;
	var savedPages = 0;
	var qlikDocsPath = path.join(__dirname, "qlikDocs");
	fs.ensureDirSync(qlikDocsPath)

	var versionPath = path.join(qlikDocsPath, version);

	fs.emptyDirSync(versionPath);

	var structsPath = path.join(versionPath, "structs");

	fs.mkdir(structsPath);

	loadStructPage("OverviewStruct")
	.then(parseStructList)
	.then(parsePages)
	.then(concatStructs)
	.then(saveStructs)
	.catch((e) => console.log(e));

	function loadStructPage(name){
		var options = {
			hostname: 'help.qlik.com',
			port: 80,
			path: '/en-US/sense-developer/'+version+'/Subsystems/EngineAPI/Content/Structs/'+name+'.htm',
			agent: false
		}
		return new Promise((resolve, reject) => {
			http.get(options, (res) => {
				if (res.statusCode != 200) reject(name + ": uploading failed");
				var html = "";
				res.on("data", (data) => {
					html += data;
				});
				res.on("end", ()=>{
					resolve(html)
				})
			});
		})
	}
	function savePage(name, attrs){
		var pagePath = path.join(structsPath, name + ".json");
		return new Promise((resolve, reject) => {
			fs.writeFile(pagePath, JSON.stringify(attrs, null, 4), function(err){
				if (err) reject(err);
				else {
					savedPages++;
					console.log("total json saved: "+savedPages+"/"+totalPages + " " +name);
					resolve();
				}
			})		
		});
	}
	function concatStructs(){
		return new Promise((resolve, reject) => {
			var structs = {}; 
			var queue = fs.readdirSync(structsPath).map(readStruct);
			Promise.all(queue).then(() => resolve(structs));
			function readStruct(file){
				var name = path.basename(file, '.json');
				return new Promise((resolve, reject) => {
					var filePath = path.join(structsPath, file);
					fs.readFile(filePath, (err, data) => {
						if (err) {
							reject(err)
						}
						else {
							var json;
							try{
								json = JSON.parse(data);
							}
							catch(e){
								reject(e);
								return;
							}
							structs[name] = json;
							resolve();
						}
					})
				})
			}
		});
	}
	function saveStructs(structs){
		var jsonPath = path.join(versionPath, "structs.json");
		return new Promise((resolve, reject) => {
			fs.writeFile(jsonPath, JSON.stringify(structs, null, 4), (err) => {
				console.log("structs saved: " + jsonPath);
				if (err) reject(err);
				else resolve();
			})
		});
	}
	function parseStructList(html){
		return new Promise((resolve, reject) => {
			const dom = new jsdom.JSDOM(html, { 
			});
			var doc = d3.select(dom.window.document);
			var list = doc.select('.MCMiniTocBox_0');
			var structs = [];    	
			var items = list.selectAll("a");
			items.each(function(){
				structs.push(this.innerHTML);
				structsMap[this.innerHTML] = true;
			});
			totalPages = structs.length;
			resolve(structs);
		})
	}
	function parsePages(structs){
		var queue = structs.map((d, i) => loadStructPage(d).then((html) => {
			loadedPages++;
			console.log("total pages loaded: "+loadedPages+"/"+totalPages + " " + d);
			return parsePage(html).then((page)=>savePage(d, page))
		}));
		return Promise.all(queue);
	}
	function parsePage(html){
		return new Promise((resolve, reject) => {
			const dom = new jsdom.JSDOM(html, { 
			});
			var doc = d3.select(dom.window.document);
			var typesDom = doc.selectAll(".MCDropDown");
			types = {};
			typesDom.each(function(){
				var dom = d3.select(this);
				var a = dom.select("a.MCDropDownHotSpot");
				var aHtml = "";
				a.each(function(){
					aHtml += this.lastChild.textContent;
				})
				types[aHtml] = {
					li:dom.selectAll("li")
				};
			})
			var table = doc.select('#topicContent').select("table");
			var rows = table.selectAll("tr");
			var struct = {};
			rows.each(function (d, i){
				if (i == 0) return
				var attr = {};
				var attrName;
				var attrType;
				var row = d3.select(this);
				var cells = row.selectAll("td");
				var descDom;
				cells.each(function(d, i){
					if (i == 0){
						attrName = this.innerHTML.replace(antiHtml, "").replace(antiSpace, "").replace(antiN, "");
					}
					else if (i == 1){
						descDom = d3.select(this);
						attr.desc = this.innerHTML.replace(antiHtml, "").replace(antiSpace, "").replace(antiStartN, "");
					}
					else if (i == 2){
						attrType = this;
					}
				})
				var attrTypeDom = row.select("td:last-child");
				if (descDom.html().match(regOneOf) != null)
					attrTypeDom = descDom;
				
				var attrTypeHtml = attrTypeDom.html();
				var checkOneOf = attrTypeHtml.match(regOneOf) != null
				var checkArrayOf = attrTypeHtml.match(regArrayOf) != null
				if (checkOneOf){
					var values = parseLi(attrTypeDom.selectAll("li"));
					var oneOfHtml = attrTypeHtml.replace(antiHtml, "");
					var split = oneOfHtml.split("•");
					split.forEach((d, i) => {
						if (i == 0) return;
						var split1 = d.split(" for ");
						var key = split1[0].trim();
						var desc = "";
						if (split1[1]) desc = "for " + split1[1].trim()
						values[key] = desc.replace(antiEndComma, "");;
					})
					attr.values = values;
					attr.type = "primitive";
				}
				else{
					var p = attrTypeDom.selectAll("p:not(.path)");
					var pHtml = "";
					p.each(function (){
						pHtml += this.innerHTML;
					})
					var sPath = attrTypeDom.selectAll("span.path");
					var sPathHtml = "";
					sPath.each(function (){
						sPathHtml += this.innerHTML;
					})
					var iPath = attrTypeDom.selectAll("i");
					var iHtml = "";
					iPath.each(function (){
						iHtml += this.innerHTML;
					})
					var pPath = attrTypeDom.selectAll("p.path");
					var pPathHtml = "";
					pPath.each(function (){
						pPathHtml += this.innerHTML;
					})
					var instance = findNotEqualInArray([pPathHtml, sPathHtml, iHtml], "");
					attr.instance = instance?instance:attrTypeHtml;
					attr.instance = attr.instance.trim();
					if (structsMap[instance]){
						attr.type = "object";
						//attr.setter = "checkInstance";
					}
					else{
						attr.type = "primitive";
						//attr.setter = "basic";
						attr.instance = getType(attr.instance);
						if (types[attr.instance]){							
							//attr.setter = "checkValue";
							attr.instance = parseLi(types[attr.instance].li);
						}
						else if (attr.instance == "JSON"){
							//attr.setter = "checkJson";
						}
					}
					if (checkArrayOf){
						attr.type = "array";
					}
				}
				function getType(str){
					var types = [
						{type:"Boolean", reg:/Boolean/g},
						{type:"Integer", reg:/Integer/g},
						{type:"String", reg:/String/g}
					]
					for (var i = 0; i < types.length; i++){
						if (str.match(types[i].reg) != null)
							return types[i].type;
					}
					return str;
				}
				function findNotEqualInArray(array, value){
					for (var i = 0; i < array.length; i++){
						if (array[i] != value) return array[i];
					}
					return undefined;
				}
				struct[attrName] = attr;
			})
			resolve(struct);
			function parseLi(li){
				var values = {};
				li.each(function(){
					var str = this.innerHTML.replace(antiHtml, "");
					var desc = "";
					var split1 = str.split(": ");
					if (split1[1] == undefined){
						split1 = str.split("; ");
					}
					if (split1[1] == undefined){
						split1 = str.split(" for ");
					}

					var key = split1[0].trim();
					var split2 = key.split(" for ");
					if (split2[1] != undefined){
						key = split2[0];
						split1[1] = "for "+split1[1]+"; " + split2[1];
					}
					if (split1[1]) desc = split1[1].trim();
					
					var split3 = key.split(" (");
					if (split3[1] != undefined){
						key = split3[0];
						desc = split3[1].split(")")[0];
					}
					values[key] = desc.replace(antiEndComma, "");
				})	
				return values;	
			}
		})
	}
}