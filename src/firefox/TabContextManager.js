with(this){
(function(){
	var TabContextManager = {
      setContext: function(contentWin, contextId, context){
      	var tabContext = this.getTabContext(contentWin)
      	if(tabContext==null){
      		throw new Error("TabContext could not be set as content win doesn't match to browser (URL: " + contentWin.location.href)
      	}
      	tabContext.setContext(contextId, context)
         return context
      },
      
      getContext: function(contentWin, contextId){
      	var tabContext = this.getTabContext(contentWin)
      	return tabContext!=null?tabContext.getContext(contextId):null
      },
      
      hasContext: function(contentWin, contextId){
         return this.getContext(contentWin, contextId)!=null
      },
      
      removeContext: function(contentWin, contextId){
         var tabContext = this.getTabContext(contentWin)
         return tabContext!=null?tabContext.removeContext(contextId):null
      },
      
      getTabContext : function(contentWin) {
         Assert.paramsNotNull(arguments)
         Assert.notNull(contentWin.top, "contentWin.top is null")
			var browser = gBrowser.getBrowserForDocument(contentWin.top.document)
			if (browser == null) {
				return null
			}
			if (browser.mouseless_tab_context == null) {
				browser.mouseless_tab_context = new TabContext()
			}
			return browser.mouseless_tab_context
		}
	}
	
	function TabContext(){
	  this.contexts = new Object()
	}
	
	TabContext.prototype = {
      setContext: function(contextId, context){
      	this.contexts[contextId] = context 
      },
      
      getContext: function(contextId){
      	return this.contexts[contextId]
      },
      
      removeContext: function(contextId){
      	var result = this.contexts[contextId] 
      	delete this.contexts[contextId]
      	return result
      }
	}

	this["TabContextManager"] = TabContextManager;
}).apply(this)
}