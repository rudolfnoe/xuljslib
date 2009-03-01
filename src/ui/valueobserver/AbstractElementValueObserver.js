with(this){
(function(){
   const EVENT_TYPE_VALUE_CHANGED = "valueChanged"
   
   function AbstractElementValueObserver(targetElement, initValue){
      this.GenericEventSource()
      this.targetElement = targetElement
      this.value = initValue
   }
   
   AbstractElementValueObserver.prototype = {
      constructor: AbstractElementValueObserver,
      AbstractElementValueObserver: AbstractElementValueObserver,
      
      getTargetElement: function(){
         return this.targetElement
      },

      getValue: function(){
         return this.value
      },

      setValue: function(value){
         if(this.value!=value){
            this.value=value
            this.notifyValueChangedListener(value)
         }
      },

      addValueChangedListener: function(listener){
         if(!ObjectUtils.instanceOf(listener["handleEvent"], Function))
            throw new Error('listener must implement handleEvent')
         this.addEventListener(EVENT_TYPE_VALUE_CHANGED, listener)
      },

      notifyValueChangedListener: function(newValue){
         this.notifyListeners({type:EVENT_TYPE_VALUE_CHANGED, newValue: newValue})   
      }
   }
   
   ObjectUtils.extend(AbstractElementValueObserver, "GenericEventSource", this)

   this.AbstractElementValueObserver = AbstractElementValueObserver;
}).apply(this)
}