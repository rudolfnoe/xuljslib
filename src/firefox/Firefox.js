with(this){
(function(){
	var Firefox = {
		//Returns the currently active tab
		getActiveBrowser: function(win){
			if(!window)
			   win = window
			return window.getBrowser().selectedBrowser
		},
      
      getBrowser: function(){
         return window.getBrowser()
      },
      
      getBrowserForContentWin: function(win){
         Assert.paramsNotNull(arguments)
         return gBrowser.getBrowserForDocument(win.top.document)
      },
      
      getTabContainer: function(){
         return getBrowser().tabContainer;   
      },
      
      iterateAllBrowsers: function(callBackFunc, thisObj){
         var browsers = gBrowser._browsers
         if(browsers!=null){
            for (var i = 0; i < browsers.length; i++) {
               ObjectUtils.callFunction(callBackFunc, thisObj, [browsers[i]])
            }
         }
      }
      
	}

	this.Firefox = Firefox;
}).apply(this)
}