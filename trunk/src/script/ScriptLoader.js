with(this){
(function(){
   const JS_SCRIPT_LOADER = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].
                     getService(Components.interfaces.mozIJSSubScriptLoader);
	const CHROME_REGISTRY = Components.classes["@mozilla.org/chrome/chrome-registry;1"].
                     getService(Components.interfaces.nsIChromeRegistry);
	const IO_SERVICE = Components.classes["@mozilla.org/network/io-service;1"].
                     getService(Components.interfaces.nsIIOService);
   
	var ScriptLoader = {
      
      /*
       * Determines URL to load out of the XPI based on the provided base url
       * Used in FF >= 4.0 as XPI will no longer be unpacked
       * @param String fullBaseUrl: Full url to base path of loading,
       * e.g.  url: jar:file:///C:/Dokumente%20und%20Einstellungen/.../extensions/customizeyourweb@mouseless.de.xpi!/chrome/content/common/firefox/
       */
      _determineUrlsFromXpi: function(fileDirUrl, recursive) {
         //split part to xpi and within xpi
         var xpiSplitterIndex = fileDirUrl.lastIndexOf("!")
         
         //Open XPI File with ZipReader
         var xpiUrl = fileDirUrl.substring(4, xpiSplitterIndex)
         var xpiUri = IO_SERVICE.newURI(xpiUrl, null, null)
         var xpiFile = xpiUri.QueryInterface(Components.interfaces.nsIFileURL).file;
         if(!xpiFile.exists()){
            throw new Error("Programm error: Wrong path to Xpi File Path")
         }
         var zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"].createInstance(Components.interfaces.nsIZipReader);
         zipReader.open(xpiFile)
         
         //Path within zip file
         var zipPath = fileDirUrl.substring(xpiSplitterIndex + 2)
         
         //Build search expression for zipReader.findEntries
         var searchExp = zipPath + "*"
         if (!recursive) {
            //If not recursive exclude subdirs
            searchExp += "~" + zipPath + "*/*"
         }
         var ze = zipReader.findEntries(searchExp)
         
         //Prefix for urlsToLoad
         var urlToLoadBasePath = fileDirUrl.substring(0, xpiSplitterIndex + 2)
         var urlsToLoad = []
         //Assemble URLs to load
         while (ze.hasMore()) {
            var zePath = ze.getNext()
            //Ignore directory enries
            var zeo = zipReader.getEntry(zePath)
            if (zeo.isDirectory){
               continue
            }
            urlsToLoad.push(urlToLoadBasePath + zePath)
         }
         return urlsToLoad
      },
      
       /* 
        * Determines URLs to load from the file system based on the provided base url
        * Used in FF < 4.0
        * @param nsIURI chromeDirUri: file URI of base path to load
        */
      _determineUrlsFromFileSystem: function(chromeDirUri, recursive){
         var dir = chromeDirUri.QueryInterface(Components.interfaces.nsIFileURL).file; 
         var files = this._readFileEntries(dir, recursive)
         var urlsToLoad = []
         for (var i = 0; i < files.length; i++) {
            urlsToLoad.push(IO_SERVICE.newFileURI(files[i]).resolve("")) 
         }
         return urlsToLoad
      },

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
      
      loadBaseClasses: function(chromeUrlIncludeCommon, ns){
         var scopeObj = this.getNamespaceObj(ns)
         this.loadScript(chromeUrlIncludeCommon+"/lang/debug/Assert.js", scopeObj)
         this.loadScript(chromeUrlIncludeCommon+"/lang/ArrayUtils.js", scopeObj)
         this.loadScript(chromeUrlIncludeCommon+"/lang/Namespace.js", scopeObj);
         this.loadScript(chromeUrlIncludeCommon+"/lang/ObjectUtils.js", scopeObj)
      },
      
      /*
       * Loads jQuery 
       * @param String chromePath: chrome path to jquery.js 
       * @param String ns: scopeObj or name of the namespace in global window
       */
      loadJQuery: function(chromeUrl, scopeObjOrNS){
         var scopeObj = this._getNamespaceObj(scopeObjOrNS)
         if(scopeObj.$ != null){
            return
         }
         this.loadScript(chromeUrl)
         //Removes jQuery from global window object
         var jQuery = window.jQuery.noConflict(true);
         //and set it for the scope obj
         scopeObj.jQuery = scopeObj.$ = jQuery
      },
		
		/*
		 * Load all scripts from a directory 
		 * @param in String chromeDirUrl: chrome path to directory which scripts should be loaded
		 * @param in Object scopeObj: Object in which context the scripts are loaded
		 * @param in Array excludeArray: Array with String or RegExp defining the files to exclude (only include or exclude could be provided)
		 * @param in Array includeArray: Array with String or RegExp defining the files to include (only include or exclude could be provided)
		 */
      loadScripts: function(chromeDirUrl, scopeObjOrNS, includeArray, excludeArray, recursive){
         if(includeArray && excludeArray)
            throw new Error('either includeArray or excludeArray could be provided but not both')
         if(!Namespace)
            throw new Error('loadBaseClasses must be called first')
         var scopeObj = this._getNamespaceObj(scopeObjOrNS)
         //make sure trailing slash
         chromeDirUrl = chromeDirUrl.lastIndexOf("/")==chromeDirUrl.length-1?chromeDirUrl:chromeDirUrl+"/"
         var chromeDirUri = IO_SERVICE.newURI(chromeDirUrl, null, null)
         //convert chrome to file uri / url
         var fileDirUri = CHROME_REGISTRY.convertChromeURL(chromeDirUri)
         var fileDirUrl = fileDirUri.resolve("")
         //Determine urls of files to load
         var urlsToLoad = null
         if(fileDirUrl.indexOf("jar:")==0){
            urlsToLoad = this._determineUrlsFromXpi(fileDirUrl, recursive)
         }else{
            urlsToLoad = this._determineUrlsFromFileSystem(fileDirUri, recursive)
         }
         for (var i = 0; i < urlsToLoad.length; i++) {
            var urlToLoad = urlsToLoad[i]
            //Load only js files only those which are not excluded
            var leafSplitterIndex = urlToLoad.lastIndexOf("/")
            var leafName = urlToLoad.substring(leafSplitterIndex+1)
            var isNoJsFile = leafName.lastIndexOf(".js")!= leafName.length-3 
            if(this._shouldBeExcluded(leafName, includeArray, excludeArray) || isNoJsFile){
               continue
            }
            this.loadScript(urlToLoad, scopeObj)
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
		_readFileEntries: function(directory, recursive, resultArray){
			if(!directory.isDirectory())
			   throw new Error('Param directory is not a directory')
			if(resultArray==null)
			   resultArray = new Array()
			var dirEnumertor = directory.directoryEntries
			while(dirEnumertor.hasMoreElements()){
				var file = dirEnumertor.getNext().QueryInterface(Components.interfaces.nsIFile)
				if(recursive && file.isDirectory())
				  this._readFileEntries(file, recursive, resultArray)
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
		
		_shouldBeExcluded: function(fileName, includeArray, excludeArray){
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
      	return includeMode?true:false;
	  }
		
	}

	this["ScriptLoader"] = ScriptLoader;
}).apply(this)
}