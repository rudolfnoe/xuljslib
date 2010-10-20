with(this){
(function(){
   const JS_SCRIPT_LOADER = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].
                     getService(Components.interfaces.mozIJSSubScriptLoader)
	const CHROME_REGISTRY = Components.classes["@mozilla.org/chrome/chrome-registry;1"].
                     getService(Components.interfaces.nsIChromeRegistry)
	const IO_SERVICE = Components.classes["@mozilla.org/network/io-service;1"].
                     getService(Components.interfaces.nsIIOService)

	var ScriptLoader = {
      
      _getNamespaceObj: function(scopeObjOrNS){
         scopeObjOrNS = scopeObjOrNS?scopeObjOrNS:window
         if(typeof scopeObjOrNS == "string")
            return this.getNamespaceObj(scopeObjOrNS)
         else
            return scopeObjOrNS
      },
      
      getNamespaceObj: function(ns, scopeObj){
         scopeObj = scopeObj?scopeObj:window
         var names = ns.split('.');
         var obj = scopeObj;
         for (key in names){
            var name = names[key];
            if(obj[name] == undefined){
               obj[name] = new Object();
            }
            obj = obj[name];
         }
         return obj;
      },
      
      loadBaseClasses: function(chromePathIncludeCommon, ns){
         var scopeObj = this.getNamespaceObj(ns)
         this.loadScript(chromePathIncludeCommon+"/lang/debug/Assert.js", scopeObj)
         this.loadScript(chromePathIncludeCommon+"/lang/ArrayUtils.js", scopeObj)
         this.loadScript(chromePathIncludeCommon+"/lang/Namespace.js", scopeObj)
         this.loadScript(chromePathIncludeCommon+"/lang/ObjectUtils.js", scopeObj)
      },
		
		/*
		 * Load all scripts from a directory 
		 * @param in String chromePath: chrome path to directory which scripts should be loaded
		 * @param in Object scopeObj: Object in which context the scripts are loaded
		 * @param in Array excludeArray: Array with String or RegExp defining the files to exclude (only include or exclude could be provided)
		 * @param in Array includeArray: Array with String or RegExp defining the files to include (only include or exclude could be provided)
		 */
		loadScripts: function(chromePath, scopeObjOrNS, includeArray, excludeArray, recursive){
         if(includeArray && excludeArray)
            throw new Error('either includeArray or excludeArray could be provided but not both')
         if(!Namespace)
            throw new Error('loadBaseClasses must be called first')
         var scopeObj = this._getNamespaceObj(scopeObjOrNS)
			chromePath = chromePath.lastIndexOf("/")==chromePath.length-1?chromePath:chromePath+"/"
         var chromeBaseUri = IO_SERVICE.newURI(chromePath, null, null)
         var chromeBaseFullUri = CHROME_REGISTRY.convertChromeURL(chromeBaseUri)
         var chromeBaseFile = chromeBaseFullUri.QueryInterface(Components.interfaces.nsIFileURL).file; 
         var startIndexSubPath  = chromeBaseFile.path.length
         var files = this.readFileEntries(chromeBaseFile, recursive)
         for (var i = 0; i < files.length; i++) {
         	var fullPath = files[i].path
         	if((fullPath.lastIndexOf(".js")!=fullPath.length-3) ||
         	     this.shouldBeExcluded(files[i].leafName, includeArray, excludeArray))
         	   continue
         	this.loadScript(chromeBaseUri.resolve(fullPath.substring(startIndexSubPath+1)), scopeObj) 
         }
         if(typeof scopeObjOrNS == "string")
            this.setNamespaceString(scopeObj, scopeObjOrNS)
		},
		
		loadScript: function(chromeUrl, scopeObjOrNS){
         JS_SCRIPT_LOADER.loadSubScript(chromeUrl, this._getNamespaceObj(scopeObjOrNS));
      },
      
      path : function(file) {
			return 'file:///'+ file.path.replace(/\\/g, '\/').replace(/^\s*\/?/, '').replace(/\ /g, '%20');
		},
		
		/*
		 * @param in nsIFile directory: starting dir
		 * @param in boolean
		 * @param in array (optional): result array needed for recursion
		 */
		readFileEntries: function(directory, recursive, resultArray){
			if(!directory.isDirectory())
			   throw new Error('Param directory is not a directory')
			if(resultArray==null)
			   resultArray = new Array()
			var dirEnumertor = directory.directoryEntries
			while(dirEnumertor.hasMoreElements()){
				var file = dirEnumertor.getNext().QueryInterface(Components.interfaces.nsIFile)
				if(recursive && file.isDirectory())
				  this.readFileEntries(file, recursive, resultArray)
				else
				  resultArray.push(file)
			}
			return resultArray
		},
      
      setNamespaceString: function(scopeObj, ns){
         for(var className in scopeObj){
            var clazz = scopeObj[className]
            if(typeof clazz == "function")
               clazz.prototype.__namespace = ns
         }
      },
		
		shouldBeExcluded: function(fileName, includeArray, excludeArray){
			if(!excludeArray && !includeArray)
			   return false
         var patternArray = includeArray?includeArray:excludeArray
         var includeMode = includeArray!=null
      	for (var i = 0; i < patternArray.length; i++) {
      		var pattern  = patternArray[i]
            var patternMatch = (pattern.constructor==String && pattern==fileName) ||
      		                      (pattern.constructor==RegExp && pattern.test(fileName))
            if(patternMatch){
               if(includeMode)
                  return false
               else
                  return true
            }
         }
      	return includeMode?true:false
	  }
		
	}

	this["ScriptLoader"] = ScriptLoader;
}).apply(this)
}