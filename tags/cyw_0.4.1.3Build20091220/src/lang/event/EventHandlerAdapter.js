with(this){
(function(){
   function EventHandlerAdapter(callbackMethod, thisObj){
      this.callbackMethod = callbackMethod
      this.thisObj = thisObj
      this.suspended = false
   }
   
   EventHandlerAdapter.prototype = {
      constructor: EventHandlerAdapter,
      
      handleEvent: function(event){
         if(!this.suspended){
            ObjectUtils.callFunction(this.callbackMethod, this.thisObj, [event])
         }
      },
      
      resume: function(){
         this.suspended = false
      },
      
      suspend: function(){
         this.suspended = true
      }
      
   }

   this.EventHandlerAdapter = EventHandlerAdapter;
}).apply(this)
}