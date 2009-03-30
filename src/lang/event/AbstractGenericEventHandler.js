with(this){
(function(){
	function AbstractGenericEventHandler(suspended){
      //Constructor will not be called in any case
      this.suspended = arguments.length>=1?suspended:undefined
	}
	AbstractGenericEventHandler.prototype = {
		constructor: AbstractGenericEventHandler,
      AbstractGenericEventHandler: AbstractGenericEventHandler,

      isSuspended: function(){
         if(this.suspended==undefined){
            this.suspended = false
         }
         return this.suspended
      },

		handleEvent: function(event){
         if(this.isSuspended()){
            return
         }
			var type = event.type
			var funcName = "handle" + type.substring(0,1).toUpperCase() + type.substring(1) 
			if(this[funcName] instanceof Function){
				this[funcName](event)
			}
		},
      
      registerMultipleEventListener: function(target, eventTypeArray, useCapture){
         for (var i = 0; i < eventTypeArray.length; i++) {
            target.addEventListener(eventTypeArray[i], this, useCapture)
         }
      },
      
      resume: function(){
         this.suspended = false
      },

      suspend: function(){
         this.suspended = true
      },
      
      unRegisterMultipleEventListener: function(target, eventTypeArray, useCapture){
         for (var i = 0; i < eventTypeArray.length; i++) {
            target.removeEventListener(eventTypeArray[i], this, useCapture)
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