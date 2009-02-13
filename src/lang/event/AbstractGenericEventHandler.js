with(this){
(function(){
	function AbstractGenericEventHandler(){
	}
	AbstractGenericEventHandler.prototype = {
		constructor: AbstractGenericEventHandler,
		
		handleEvent: function(event){
			var type = event.type
			var funcName = "handle" + type.substring(0,1).toUpperCase() + type.substring(1) 
			if(this[funcName] instanceof Function){
				this[funcName](event)
			}
		},
      
      registerMultipleEventListener: function(element, eventTypeArray, useCapture){
         for (var i = 0; i < eventTypeArray.length; i++) {
            element.addEventListener(eventTypeArray[i], this, useCapture)
         }
      },
      
      unRegisterMultipleEventListener: function(element, eventTypeArray, useCapture){
         for (var i = 0; i < eventTypeArray.length; i++) {
            element.removeEventListener(eventTypeArray[i], this, useCapture)
         }
      }
	}
   this["AbstractGenericEventHandler"] = AbstractGenericEventHandler;
   
   /*
    * Constructor for KeyEventHandler
    */
   function KeyEventHandler(shortcutManager, scmHandleEventFunction){
      this.shortcutManager = shortcutManager
      this.scmHandleEventFunction = scmHandleEventFunction
      this.handleEvent = function(event){
         this.shortcutManager[this.scmHandleEventFunction](event)
      }
   }
   this.KeyEventHandler = KeyEventHandler;
   
}).apply(this)
}