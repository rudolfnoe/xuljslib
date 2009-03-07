with(this){
(function(){
   const JS_SCRIPT_LOADER = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].
                     getService(Components.interfaces.mozIJSSubScriptLoader)
	const CHROME_REGISTRY = Components.classes["@mozilla.org/chrome/chrome-registry;1"].
                     getService(Components.interfaces.nsIChromeRegistry)
	const IO_SERVICE = Components.classes["@mozilla.org/network/io-service;1"].
                     getService(Components.interfaces.nsIIOService)

	var ScriptLoader = {
		
		/*
		 * Load all scripts from a directory 
		 * @param in String chromePath: chrome path to directory which scripts should be loaded
		 * @param in Object scopeObj: Object in which context the scripts are loaded
		 * @param in Array excludeArray: Array with String or RegExp defining the files to exclude
		 */
		loadScripts: function(chromePath, scopeObj, excludeArray, recursive){
			chromePath = chromePath.lastIndexOf("/")==chromePath.length-1?chromePath:chromePath+"/"
         var chromeBaseUri = IO_SERVICE.newURI(chromePath, null, null)
         var chromeBaseFullUri = CHROME_REGISTRY.convertChromeURL(chromeBaseUri)
         var chromeBaseFile = chromeBaseFullUri.QueryInterface(Components.interfaces.nsIFileURL).file; 
         var startIndexSubPath  = chromeBaseFile.path.length
         var files = this.readFileEntries(chromeBaseFile, recursive)
         for (var i = 0; i < files.length; i++) {
         	var fullPath = files[i].path
         	if((fullPath.lastIndexOf(".js")!=fullPath.length-3) ||
         	     this.shouldBeExcluded(files[i].leafName, excludeArray))
         	   continue
         	this.loadScript(chromeBaseUri.resolve(fullPath.substring(startIndexSubPath+1)), scopeObj) 
         }
		},
		
		loadScript: function(url, scopeObj){
         JS_SCRIPT_LOADER.loadSubScript(url, scopeObj);
      },
      
      loadSingleScript: function(chromePath, scopeObj){
      	this.loadScript(chromePath, scopeObj)
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
		
		shouldBeExcluded: function(fileName, excludeArray){
			if(excludeArray==null)
			   return false
      	for (var i = 0; i < excludeArray.length; i++) {
      		var exclude = excludeArray[i]
      		if((exclude.constructor==String && exclude==fileName) ||
      		    (exclude.constructor==RegExp && excludeArray[i].test(fileName))){
      		   return true
      		}
      	}
      	return false
	  }
		
	}

	this["ScriptLoader"] = ScriptLoader;
}).apply(this)
}