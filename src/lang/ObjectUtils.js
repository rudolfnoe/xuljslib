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
      //Map: key: SuperClass name (string), value: Array of constructor functions of the corresponding subclasses
      waitTillSuperClassIsLoadedMap: {},
      
      /*
       * Add subclass constructor the a global map where the key is the name of the superclass which is not loaded yet
       * and the value is an array of subclasses waiting to be initialized
       */
      _addToSuperclassNameToSubclassConstructorMap: function(superClassName, subClassConstructor){
         if(this.waitTillSuperClassIsLoadedMap[superClassName]==null){
            this.waitTillSuperClassIsLoadedMap[superClassName] = new Array()
         }
         this.waitTillSuperClassIsLoadedMap[superClassName].push(subClassConstructor)
      },
      
      /*
       * Adds the name of a not yet loaded superclass to an array stored as a memeber of the constructor
       * of the waiting subclass 
       */
      _storeSuperclassToWaitFor: function(constructorSubClass, superClassName){
         //Temporary storing of superclasses to wait in subclass constr. 
         if(constructorSubClass.__superClassesToWait==null){
            constructorSubClass.__superClassesToWait = new Array()
         }
         if(constructorSubClass.__superClassesToWait.indexOf(superClassName)==-1){
            constructorSubClass.__superClassesToWait.push(superClassName)
         }
      },
      
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
      
      /*
       * Creates a deep clone of the provided obj
       */
      deepClone: function(obj){
         return this._deepClone(obj, new Map())         
      }, 
      
      /*
       * Internal clone method
       * @param obj: obj to clone
       * @param objToCloneIdentityMap: identiy map to handle avoid multiple clones of the same obj
       * TODO check performance issues for large objects!!! If applicable use 
       */
      _deepClone: function(obj, objToCloneIdentityMap){
         var existingClone = objToCloneIdentityMap.get(obj)
         if(existingClone){
            return existingClone
         }
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
               objToCloneIdentityMap.put(obj, clone)
               for (var i = 0; i < obj.length; i++) {
                  clone[i] = this._deepClone(obj[i], objToCloneIdentityMap)
               }
               break;
            case BasicObjectTypes.OBJECT:
               clone = {}
               //no break for further copying of members
            default:
               //Clone must be instantiated anew to assure that
               //the newly created obj has the scope of the current window
               if(!clone){
                  Assert.notNull(obj.__namespace, "__namespace must not be null. Obj: " + obj.toString())
                  Assert.notNull(window[obj.__namespace], "Namespace object named '" + obj.__namespace + "' is null")
                  Assert.notNull(window[obj.__namespace][t], "Constructor for object '" + t + "' is null")
                  Assert.isTrue(window[obj.__namespace][t] instanceof Function, "Constructor for object '" + t + "' is not a function")
                  clone = new window[obj.__namespace][t]()
               }
               objToCloneIdentityMap.put(obj, clone)
               for(var m in obj){
                  //Prototype must not be cloned as this results undefined errors when an object is
                  //created in a Dialog and afterwards used in the opener after the context (the dialog window) is closed.
                  if(obj.hasOwnProperty(m))
                     clone[m] = this._deepClone(obj[m], objToCloneIdentityMap)
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
       * Inheritence mechanism
       * Only functions are inherited
       * @param function ptr constructorSubClass: Pointer to the constructor function of the subclass
       * @param function ptr|String constructorSuperClassOrName: Pointer ot or Name of the constructor function of the superclass
       * @param Object namespaceObj: Namespace object of the superclass
       */
      extend : function(constructorSubClass, constructorSuperClassOrName, namespaceObj) {
         Assert.notNull(constructorSubClass, 'Param constructorSubClass must not be null')
         Assert.notNull(constructorSuperClassOrName, 'Param constructorSuperClass must not be null')
         
         //Determine supclass name and pointer to superclass function
         var superClassName = null
         var constructorSuperClass = null
         if(typeof constructorSuperClassOrName == "string"){
            Assert.notNull(namespaceObj, 'When providing contstructor as string namespace obj must not be null')
            Assert.isTrue(typeof namespaceObj != "string", 'NamespaceObj must not be provided as string')
            superClassName = constructorSuperClassOrName
            constructorSuperClass = namespaceObj[superClassName]
         }else{
            constructorSuperClass = constructorSuperClassOrName
            superClassName = this.getTypeFromConstructor(constructorSuperClass)
         }
         
         //If superclass is not loaded yet, define watch point and store subclass constructor for later initialization
         if(constructorSuperClass==null){
//          consoleService.logStringMessage(constructorSuperClass + " not loaded yet");
            if(this.waitTillSuperClassIsLoadedMap[superClassName]==null){
               //create map for storing waiting subclasses
               this.waitTillSuperClassIsLoadedMap[superClassName] = new Array()
               
               //create watch for responding of binding to namespace
               namespaceObj.watch(superClassName, function(prop, oldval, newval){
                  var boundConstructorSuperClass = newval
//                  consoleService.logStringMessage(superClassName + " just loaded" + " Stack: " + (new Error()).stack);
                  var subclasses = ObjectUtils.waitTillSuperClassIsLoadedMap[superClassName]
                  while(subclasses.length>0){
                     var constructorWaitingSubClass = subclasses.pop()
                     ObjectUtils.extend(constructorWaitingSubClass, boundConstructorSuperClass)
                  }
                  return boundConstructorSuperClass
               })
            }
            this._addToSuperclassNameToSubclassConstructorMap(superClassName, constructorSubClass)
            
            this._storeSuperclassToWaitFor(constructorSubClass, superClassName)
            return
         }

         //If superclass is also waiting on it's superclass make sure functionality of super-super-class is added to subclass as well 
         if(constructorSuperClass.__superClassesToWait!=null){
            for (var i = 0; i < constructorSuperClass.__superClassesToWait.length; i++) {
               var superSuperClassConstructorName = constructorSuperClass.__superClassesToWait[i]
               ObjectUtils._addToSuperclassNameToSubclassConstructorMap(superSuperClassConstructorName, constructorSubClass)
               this._storeSuperclassToWaitFor(constructorSubClass, superSuperClassConstructorName)
            }
         }
         
         //Remove superclass name form array of superclasses the subclass is waiting on and delete array if empty
         if(constructorSubClass.__superClassesToWait!=null){
            constructorSubClass.__superClassesToWait = constructorSubClass.__superClassesToWait.filter(function(superclassToWaitName){
               return superclassToWaitName != superClassName
            })
            if(constructorSubClass.__superClassesToWait.length==0){
               delete constructorSubClass.__superClassesToWait
            }
         }
//         consoleService.logStringMessage(ObjectUtils.getTypeFromConstructor(constructorSubClass) + " extends " + superClassName);
         
         //Here begins the actual process of inheritence
         //Only functions are copied to subclasses
         var prototypeSuperClass = constructorSuperClass.prototype
         var prototypeSubClass = constructorSubClass.prototype 

         for (var member in prototypeSuperClass) {
            if(typeof prototypeSuperClass[member] != "function"){
               continue
            }
            var propName = null
            if(prototypeSubClass.hasOwnProperty(member)){
               //Enable subclasses to call overridden functions by prefixing it with the Superclass name
               var memberName = superClassName + "_" + member 
            }else{
               var memberName = member
            }
            prototypeSubClass[memberName] = prototypeSuperClass[member]
         }
         //set reference to superclass constructor in subclass so it can be initialized
         //via a call within the subclass contructor
         prototypeSubClass[superClassName] = constructorSuperClass
         
         //Fill supertype array in subclass for type-checking purposes
         if(!prototypeSubClass.__supertypes){
            prototypeSubClass.__supertypes = new Array()
         }
         prototypeSubClass.__supertypes.push(superClassName)
         if(prototypeSuperClass.__supertypes!=null){
            prototypeSubClass.__supertypes = ArrayUtils.concatAsSet(prototypeSubClass.__supertypes, prototypeSuperClass.__supertypes)
         }
         
//         consoleService.logStringMessage(ObjectUtils.getTypeFromConstructor(constructorSubClass) + " extends " + 
//            this.getTypeFromConstructor(constructorSuperClass) +
//            " supertypes: " + prototypeSubClass.__supertypes.toString());
            
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