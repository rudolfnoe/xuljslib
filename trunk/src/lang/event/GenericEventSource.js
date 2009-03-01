with(this){
(function(){
   function GenericEventSource(){
      this.listeners = new ArrayList()
   }
   
   GenericEventSource.prototype = {
      GenericEventSource: GenericEventSource,

      addListener: function(type, callbackFuncOrEventHandler, thisObj){
         this.removeListener(type, callbackFuncOrEventHandler, thisObj)
         this.listeners.add(this.createEvenListenerWrapper(type, callbackFuncOrEventHandler, thisObj))
      },
      
      addEventListener: function(type, callbackFuncOrEventHandler, thisObj){
         this.addListener(type, callbackFuncOrEventHandler, thisObj)
      },
      
      createEvenListenerWrapper: function(type, callbackFuncOrEventHandler, thisObj){
         if(ObjectUtils.instanceOf(callbackFuncOrEventHandler.handleEvent, Function)){
            return new EventListenerWrapper(type, callbackFuncOrEventHandler)
         }else{
            return new GenericEventListener(type, callbackFuncOrEventHandler, thisObj)
         }
      },
      
      getListener: function(type, callbackFuncOrEventHandler, thisObj){
         var listener = this.createEvenListenerWrapper(type, callbackFuncOrEventHandler, thisObj)
         for (var i = 0; i < this.listeners.size(); i++) {
            if(this.listeners.get(i).equals(listener)){
               return this.listeners.get(i)
            }
         }
         return null;
      },
      
      notifyListeners: function(event){
         for (var i = 0; i < this.listeners.size(); i++) {
            if(this.listeners.get(i).isType(event.type))
               this.listeners.get(i).handleEvent(event)
         }
      },
      
      removeListener: function(type, callbackFuncOrEventHandler, thisObj){
         var oldListener = this.getListener(type, callbackFuncOrEventHandler, thisObj)
         if(oldListener)
            this.listeners.remove(oldListener)
      }
   }
   
   /*
    * Abstract superclass for event listeners
    */
   function AbstractEventListener(type){
      this.type = type?type:null
   }
   
   AbstractEventListener.prototype = {
      constructor: AbstractEventListener,
      AbstractEventListener: AbstractEventListener,

      isType: function(type){
         return this.type == "*" || this.type == type
      },
      
      handleEvent: function(event){
        throw new Error('must be overridden') 
      }
   }

      
   function GenericEventListener(type, callbackFunc, thisObj){
      this.AbstractEventListener(type)
      this.callbackFunc = callbackFunc
      this.thisObj = thisObj
   }
   
   GenericEventListener.prototype = {
      equals: function(listener){
         if(listener.type==this.type &&
            listener.callbackFunc==this.callbackFunc &&
            listener.thisObj==this.thisObj){
               return true
         }else{
            return false
         }
         
      },
      
      handleEvent: function(event){
         ObjectUtils.callFunction(this.callbackFunc, this.thisObj, [event])
      }
   }
   ObjectUtils.extend(GenericEventListener, AbstractEventListener)
   
   function EventListenerWrapper(type, eventListener){
      this.AbstractEventListener(type)
      this.eventListener = eventListener
   }
   
   EventListenerWrapper.prototype = {
      constructor: EventListenerWrapper,
      EventListenerWrapper: EventListenerWrapper,

      equals: function(listener){
         if(listener.type==this.type && listener == this.eventListener){
            return true
         }else{
            return false
         }
      },
      
      handleEvent: function(event){
         this.eventListener.handleEvent(event)
      }
   }
   ObjectUtils.extend(EventListenerWrapper, AbstractEventListener)
   
   this["GenericEventSource"] = GenericEventSource
}).apply(this)
}