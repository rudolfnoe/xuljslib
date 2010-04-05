with(this){
(function(){
   function JQueryLoader(jQueryBaseChromePath){
      if(!StringUtils.endsWith(jQueryBaseChromePath, "/")){
         jQueryBaseChromePath += "/"
      }
      this.chromePath = jQueryBaseChromePath
   }
   
   JQueryLoader.prototype = {
      constructor: JQueryLoader,
      
      loadJQuery: function(fileName, scopeObj){
         if(scopeObj.$ != null){
            return
         }
         ScriptLoader.loadScript(this.chromePath + fileName)
         //Removes jQuery from global window object
         var jQuery = window.jQuery.noConflict(true)
         //and set it for the scope obj
         scopeObj.jQuery = scopeObj.$ = jQuery
      },
      
      loadJQueryUI: function(fileName, scopeObj){
         if(scopeObj.$==null){
            throw new Error('JQuery Core must be loaded at first')
         }
         var jQueryBackup = window.$ 
         window.$ = scopeObj.$
         ScriptLoader.loadScript(this.chromePath + fileName, scopeObj)
         window.$ = jQueryBackup
      }
   }

   this.JQueryLoader = JQueryLoader;
}).apply(this)
}