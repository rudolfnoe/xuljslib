with(this){
(function(){
   const EVENT_TYPE_VALUE_CHANGED = "valueChanged"
   
   /*
    * Abstract superclass of all element value observers
    * The responsibility of value observers is to notify their listeners
    * in case the value of the observed forme element has changed
    * Implements generic logic which is common for all value observers  
    */
   function AbstractControlValueObserver(targetElement, initValue){
      this.GenericEventSource()
      this.targetElement = targetElement
      this.value = initValue
   }
   
   AbstractControlValueObserver.prototype = {
      constructor: AbstractControlValueObserver,
      AbstractControlValueObserver: AbstractControlValueObserver,
      
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
         this.addEventListener(EVENT_TYPE_VALUE_CHANGED, listener)
      },

      notifyValueChangedListener: function(newValue){
         this.notifyListeners({type:EVENT_TYPE_VALUE_CHANGED, newValue: newValue})   
      }
   }
   
   ObjectUtils.extend(AbstractControlValueObserver, "GenericEventSource", this)

   this.AbstractControlValueObserver = AbstractControlValueObserver;
}).apply(this)
}