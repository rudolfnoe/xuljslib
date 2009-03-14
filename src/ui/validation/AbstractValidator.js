with(this){
(function(){
   const EVENT_TYPE_VALID_STATE_CHANGED = "validStateChanged"
   
   function AbstractValidator(){
      this.GenericEventSource()
      this.validState = null
   }
   
   AbstractValidator.prototype = {
      constructor: AbstractValidator,
      AbstractValidator:AbstractValidator,
      
      addValidStateChangedListener: function(listener){
         this.addEventListener(EVENT_TYPE_VALID_STATE_CHANGED, listener)      
      },
      
      isValid: function(){
         throw new Error('must be implemented')
      },

      notifyValidStateChanged: function(newValue){
         this.notifyListeners({type:EVENT_TYPE_VALID_STATE_CHANGED, newValue:newValue})      
      },
      
      setValidState: function(valid){
         if(this.validState!=valid){
            this.validState = valid
            this.notifyValidStateChanged(valid)
         }
      },
      
      validate: function(){
         this.setValidState(this.isValid())
      }
      
   }
   
   ObjectUtils.extend(AbstractValidator, "GenericEventSource", this)

   this.AbstractValidator = AbstractValidator;
}).apply(this)
}