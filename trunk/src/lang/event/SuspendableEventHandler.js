with(this){
(function(){
   function SuspendableEventHandler(eventHandler, suspended){
      this.eventHandler = eventHandler
      this.suspended = arguments.length>=2?suspended:false
   }
   
   SuspendableEventHandler.createHandlerFromFunction = function(callbackFunction, thisObj, suspended){
      var eventHandler = {handleEvent: function(event){
         ObjectUtils.callFunction(callbackFunction, thisObj)
      }}
      return new SuspendableEventHandler(eventHandler, suspended)
   }
   
   SuspendableEventHandler.prototype = {
      getSuspended: function(){
         return this.suspended
      },

      setSuspended: function(suspended){
         this.suspended = suspended
      },
      
      handleEvent: function(event){
         if(this.suspended)
            return
         this.eventHandler.handleEvent(event)
      },
      
      resume: function(){
        this.setSuspended(false) 
      },
      
      suspend: function(){
         this.setSuspended(true)
      }
   }

   this.SuspendableEventHandler = SuspendableEventHandler;
}).apply(this)
}