with(this){
(function(){
   const EVENT_TYPE_VALID_STATE_CHANGED = "validStateChanged"
   
   function AbstractValidator(){
      this.AbstractGenericEventSource()
      this.validState = null
   }
   
   AbstractValidator.EVENT_TYPE_VALID_STATE_CHANGED = EVENT_TYPE_VALID_STATE_CHANGED
   
   AbstractValidator.prototype = {
      constructor: AbstractValidator,
      AbstractValidator:AbstractValidator,
      
      addValidStateChangedListener: function(listener){
         if(!ObjectUtils.instanceOf(listener["handleEvent"], Function))
            throw new Error('listener must implement handleEvent')
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
   
   ObjectUtils.extend(AbstractValidator, "AbstractGenericEventSource", this)

   this.AbstractValidator = AbstractValidator;
}).apply(this)
}