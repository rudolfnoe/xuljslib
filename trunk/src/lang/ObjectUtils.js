with(this){
(function(){
   //for debug purposes
   var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
         .getService(Components.interfaces.nsIConsoleService);
   
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
      
		callFunction: function(functionPnt, thisObj, args){
         thisObj = thisObj?thisObj: this
         functionPnt.apply(thisObj, args)
      },
      
      /* check whether the provided obj contains a member with the provided value*/
      containsValue: function(obj, memberVal){
         Assert.paramsNotNull(arguments)
         for(var m in obj){
            if(obj[m]==memberVal)
               return true
         }
         return false
      },
      
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
				case BasicObjectTypes.OBJECT:
               clone = {}
               //no break for further copying of members
				default:
               //Clone must be instantiated via eval to assure that
               //the newly created obj has the scope of the current window
               if(!clone)
                  clone = eval("new " + obj.__namespace + "." + t +"()")
				   for(var m in obj){
                  //Prototype must not be cloned as this results undefined errors when an object is
                  //created in a Dialog and afterwards used in the opener after the context (the dialog window) is closed.
                  if(obj.hasOwnProperty(m))
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
      
      /*
       * Only functions are inherited
       */
      _waitOnSuperClassLoadMap: {},
      extend : function(constructorSubClass, constructorSuperclass, namespaceObj) {
         var constructorSuperclassFunc = null 
         if(typeof constructorSuperclass == "string"){
            if(!namespaceObj)
               throw new Error('When providing contstructor as string namespace obj must not be null')
            if(typeof namespaceObj == "string")
               throw new Error('namespaceObj must not be provided as string')
            constructorSuperclassFunc = namespaceObj[constructorSuperclass]
         }else{
            if(constructorSuperclass==null)
               throw new Error('constructorSuperclass must not be null')
            constructorSuperclassFunc = constructorSuperclass
         }
            
         if(constructorSuperclassFunc==null){
            //TODO remove
//            consoleService.logStringMessage(constructorSuperclass + " not loaded yet");
            if(this._waitOnSuperClassLoadMap[constructorSuperclass]==null){
               this._waitOnSuperClassLoadMap[constructorSuperclass] = new Array()
               namespaceObj.watch(constructorSuperclass, function(prop, oldval, newval){
//                  consoleService.logStringMessage(constructorSuperclass + "just loaded");
                  var subclasses = ObjectUtils._waitOnSuperClassLoadMap[prop]
                  while(subclasses.length>0){
                     var subclassConstructor = subclasses.pop()
                     ObjectUtils.extend(subclassConstructor, newval)
//                     consoleService.logStringMessage(ObjectUtils.getTypeFromConstructor(subclassConstructor) + " extends " + constructorSuperclass);
                  }
                  return newval
               })
            }
            this._waitOnSuperClassLoadMap[constructorSuperclass].push(constructorSubClass)
            return
         }
         //Function members will be copied explicitly to support multiple inheritance
         function copyMembers(source, target){
            for (var member in source) {
               if(!target.prototype.hasOwnProperty(member) && (typeof source[member] == "function")){
                 target.prototype[member] = source[member]
               }
            }
         }
         var source = constructorSuperclassFunc.prototype
         do{
            copyMembers(source, constructorSubClass)
            source = source.prototype
         }while(source!=null)
         //fill supertype array for instanceof
         var prototypeSubType = constructorSubClass.prototype
         var prototypeSuperType = constructorSuperclassFunc.prototype
         if(!prototypeSubType.__supertypes)
            prototypeSubType.__supertypes = new Array()
         prototypeSubType.__supertypes.push(this.getTypeFromConstructor(constructorSuperclassFunc))
         if(prototypeSuperType.__supertypes)
            prototypeSubType.__supertypes = prototypeSubType.__supertypes.concat(prototypeSuperType.__supertypes) 
//         consoleService.logStringMessage(ObjectUtils.getTypeFromConstructor(constructorSubClass) + " extends " + 
//            this.getTypeFromConstructor(constructorSuperclassFunc) +
//            " supertypes: " + prototypeSubType.__supertypes.toString());
            
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
            return this.getTypeFromConstructor(object.constructor)
   		}else{
   			throw Error('Unkown object')
   		}
   	},
      
      getTypeFromConstructor: function(constructorFunc){
		   var constructorString = constructorFunc.toString()
		   return constructorString.match(/^function (\w*)\(/)[1]
      },
   	
      injectFunctions: function(targetObj, sourceObj){
         for(var memberKey in sourceObj){
            var member = sourceObj[memberKey]
            if(this.instanceOf(member, Function) && !targetObj.hasOwnProperty(memberKey)){
               targetObj[memberKey] = sourceObj[memberKey]
            }
         }
      },

      //Checks wether obj has all functions of constructor
   	instanceOf: function(obj, constructorFunc){
         if(obj==null)
            return false
         if(this.getType(obj) == this.getTypeFromConstructor(constructorFunc))
            return true
   		if(!obj.__supertypes)
            return false
         return obj.__supertypes.indexOf(this.getTypeFromConstructor(constructorFunc))!=-1
   	} 
     
	}
	
	this["ObjectUtils"] = ObjectUtils;
}).apply(this)
}