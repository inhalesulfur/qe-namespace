if (module && module.exports){
	function define(paths, callback){
		module.exports = callback();
	}
}
define([], function(){

	function buildNamespace(json){
		var namespace = {

		}
		var structs = JSON.parse(json);
		each.call(structs, function(struct, structName){
			namespace[structName] = new Function("constructor", "return function " + structName + "(){ constructor.apply(this, arguments) };")(constructor);
			function constructor() {
				var self = this;
				each.call(struct, function(prop, propName){
					if (prop.type == "object"){
						self[propName] = new namespace[prop.instance];
					}
					if (prop.type == "array"){
						var array = [];
						self[propName] = array;
						var arrayPush = array.push;
						array.push = function(value){
							if (namespace[prop.instance]){
								if (value == undefined){
									value = new namespace[prop.instance];
								}
								else{

								}
							}

							arrayPush.call(array, value);
							return value;
						}
						if (self.add == undefined){
							self.add = function(key, value){

							}
							self.add[propName] = function(value){
								
								return value;
							}
						}
					}
				})
			}
		})
		return namespace;
	} 
	function each(callback){
		for (var i in this){
			if (this.hasOwnProperty(i)){
				callback.call(this, this[i], i);
			}
		}
	}
	return {
		buildNamespace:buildNamespace
	}
})