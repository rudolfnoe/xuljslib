with(this){
(function(){
   const VALUE_CHANGE_EVENT_TYPE = "VALUE_CHANGE_EVENT_TYPE"
   
   function ValueChangeEventSource(){
      this.GenericEventSource()
   }
   
   ValueChangeEventSource.prototype = {
      constructor: ValueChangeEventSource,
      
      addValueChangeListener: function(eventHandler, thisObj){
         this.addEventListener(VALUE_CHANGE_EVENT_TYPE, eventHandler, thisObj)
      },
      
      notifyListeners: function(newValue){
         this.GenericEventSource_notifyListeners({type: VALUE_CHANGE_EVENT_TYPE, value: newValue})   
      }
   }
   
   ObjectUtils.extend(ValueChangeEventSource, "GenericEventSource", this)

   this.ValueChangeEventSource = ValueChangeEventSource;
}).apply(this)
}