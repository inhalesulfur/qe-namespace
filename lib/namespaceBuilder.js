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
                    var st = struct[key];
                    var className = st.class;
                    var constr = namespace[className];
                    if (st && constr){
                        var checkInstance = value instanceof constr;
                        if (!checkInstance){
                            throw new TypeError("setted value is not an instance of the " + className);
                        }
                    }
                    self[key] = value;
                    return self;
                }
            
                self.init = function(key){
                    var st = struct[key];
                    var className = st.class;
                    var constr = namespace[stcl];
                    if (st == undefined){
                        throw new TypeError("struct "+structName+" doesnt have proprerty "+ key);
                    }
                    else if (constr){
                        self[key] = new constr;
                    }
                    else {
                        throw new TypeError("namespace doesnt have class "+ className);
                    }
                    return self[key];
                }
                self.stringify = JSON.stringify.bind(null, self);
                each.call(struct, function(prop, propName){
                    var className = prop.class;
                    var constr = namespace[className];
                    
                    if (prop.type == "array"){
                        
                        self[propName] = [];
                        if (constr){
                            self[propName].pushNew = function(){
                                var obj = new constr;
                                Array.prototype.push.call(self[propName], obj);
                                return obj;
                            }
                        }
                        self[propName].push = function(value){
                            if (constr){
                                var checkInstance = value instanceof constr;
                                if (!checkInstance){
                                    throw new TypeError("pushed value is not an instance of the " + className);
                                }
                            }
                            Array.prototype.push.call(self[propName], value);
                            return self[propName];
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
                            var checkInstance = object instanceof constr;
                            if (!checkInstance){
                                throw new TypeError("setted object is not an instance of the " + className);
                            }
                            self[propName] = object;
                            return self;
                        };
                        self.set[propName].instanseOf = constr;
                        self.init[propName] = function(){
                            self[propName] = new constr;
                            return self[propName];
                        };        
                        self.init[propName].instanseOf = constr;
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