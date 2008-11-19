with(this){
(function(){
	var BasicObjectTypes = {
		ARRAY: "Array",
		BOOL: "Boolean",
		FUNCTION: "Function",
		NUMBER: "Number",
		OBJECT: "Object",
		REG_EXP: "RegExp",
		STRING: "String"
	}
   this["BasicObjectTypes"] = BasicObjectTypes;
	
	var ObjectUtils = {
		deepClone: function(obj){
			var t = this.getType(obj)
			var clone = null
			switch (t){
				case null:
				case BasicObjectTypes.BOOL:
				case BasicObjectTypes.STRING:
				case BasicObjectTypes.NUMBER:
				case BasicObjectTypes.FUNCTION:
				case BasicObjectTypes.REG_EXP:
				   clone = obj
				   break;
				   
				case BasicObjectTypes.ARRAY:
				   clone = new Array(obj.length)
				   for (var i = 0; i < obj.length; i++) {
				   	clone[i] = this.deepClone(obj[i])
				   }
				   break;
				
				default:
				   clone = new obj.constructor()
				   for(var m in obj){
				   	clone[m] = this.deepClone(obj[m])
			      }
			}
   		return clone
		},

   	deepEquals: function(o1, o2){
   		if(o1===o2) 
   		   return true
   
   		var t1 = this.getType(o1)
   		var t2 = this.getType(o2)
   		
   		//Functions are ignored
   		if(t1==BasicObjectTypes.FUNCTION)
   		   return true
   
   		if(t1!=t2) 
   		   return false
   		
   		switch (t1){
   			case BasicObjectTypes.BOOL: 
   			case BasicObjectTypes.NUMBER:
   			case BasicObjectTypes.STRING:
               if(o1!=o2) 
                  return false
               break;
            
   			case BasicObjectTypes.ARRAY:
               if(o1.length!=o2.length)
                  return false
               for (var i = 0; i < o1.length; i++) {
               	if(!this.deepEquals(o1[i], o2[i]))
               	  return false
               }
   			   break
   			
   			case BasicObjectTypes.REG_EXP:
   			   if(o1.toString()!=o2.toString())
                  return false
               break
   			
   			default:
   			   for(var m in o1){
   			   	if(!this.deepEquals(o1[m], o2[m]))
                     return false
   			   }
      			//Check addtional member in o2
         		for (var m in o2) {
         			var t = this.getType(o2[m])
         			if(t==BasicObjectTypes.FUNCTION)
         			   continue
         		   if(o1[m]==null && o2[m]!=null)
         		      return false
         		}
   		}
   		return true
   	},
	
      extend : function(constructorSubClass, constructorSuperclass) {
         function copyMembers(source, target){
            for (var member in source) {
               if(!target.prototype.hasOwnProperty(member)){
                 target.prototype[member] = source[member]
               }
            }
            
         }
         var source = constructorSuperclass.prototype
         do{
            copyMembers(source, constructorSubClass)
            source = source.prototype
         }while(source!=null)
      },
   
   	getType: function(object){
   		if(object==null)
   		   return null
   		   
   		var type = typeof object
   		if(type!="object")
   		   return type.substring(0,1).toUpperCase() + type.substring(1)
   		
   		var className = Object.prototype.toString.apply(object)
   		className = className.substring(8, className.length-1)
   		
   		if(className!="Object") 
   		   return className
   		   
   		if(object.constructor == Object)
   		   return BasicObjectTypes.OBJECT
   		
   		if(object.constructor && object.constructor.toString().indexOf("function")==0){
   		   var constructor = object.constructor.toString()
   		   var className = constructor.match(/^function (\w*)\(/)[1]
   		   return className
   		}else{
   			throw Error('Unkown object')
   		}
   	},
   	
   	//Checks wether obj has all functions of constructor
   	instanceOf: function(obj, constructorFunc){
   		var proto = constructorFunc.prototype
   		for(var m in proto){
   			var value = proto[m]
   			if(this.getType(value)==BasicObjectTypes.FUNCTION && 
   			   this.getType(obj[m])!=BasicObjectTypes.FUNCTION){
   			   	return false
   			}
   		}
   		return true
   	}
	}
	
	this["ObjectUtils"] = ObjectUtils;
}).apply(this)
}