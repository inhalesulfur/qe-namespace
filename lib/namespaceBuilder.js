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
				self.set = function(key, value){
					if (struct[key] && namespace[struct[key].instance]){
						var checkInstance = value instanceof instance;
						if (!checkInstance){
							throw new TypeError("setted value is not an instance of the " + struct[key].instance);
						}
					}
					self[key] = value;
					return self;
				}
			
				self.init = function(key){
					if (struct[key] == undefined){
						throw new TypeError("struct "+structName+" doesnt have proprerty "+ key);
					}
					else if (namespace[struct[key].instance]){
						var instance = namespace[struct[key].instance];
						self[key] = new instance;
					}
					else {
						throw new TypeError("namespace doesnt have class "+ struct[key].instance);
					}
					return self[key];
				}
				self.stringify = JSON.stringify.bind(null, self);
				each.call(struct, function(prop, propName){
					
					if (prop.type == "array"){
						
						self[propName] = [];
						self[propName].push = function(value){
							if (namespace[prop.instance]){
								if (value == undefined){
									value = new namespace[prop.instance];
								}
								var checkInstance = value instanceof namespace[prop.instance];
								if (!checkInstance){
									throw new TypeError("pushed value is not an instance of the " + prop.instance);
								}
							}
							Array.prototype.push.call(self[propName], value);
							return value;
						}
					}
					if (prop.type == "primitive"){
						self.set[propName] = function(primitive){
							if (prop.values){
								var checkValue = false;
								each.call(prop.values, function(desc, key){
									if (key == primitive){
										checkValue = true;
									}
								})
								if (checkValue == false){
									throw new TypeError("wrong value setted. posible values: \n" + JSON.stringify(prop.values, null, 4))
								}
							}
							self[propName] = primitive;
							return self;
						};	
						if (prop.values){
							self.set[propName].values = prop.values;
						}
					}
					if (prop.type == "object"){
						self.set[propName] = function(object){
							var checkInstance = object instanceof namespace[prop.instance];
							if (!checkInstance){
								throw new TypeError("setted object is not an instance of the " + prop.instance);
							}
							self[propName] = object;
							return self;
						};
						self.set[propName].instanseOf = namespace[prop.instance];
						self.init[propName] = function(){
							self[propName] = new namespace[prop.instance];
							return self[propName];
						};		
						self.init[propName].instanseOf = namespace[prop.instance];
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
	function injectProtoMethods(obj){
        for (var method in this.prototype){
            if (this.prototype.hasOwnProperty(method)){
                obj[method] = this.prototype[method];
            }
        }
        return obj;
    };
	return {
		buildNamespace:buildNamespace
	}
})