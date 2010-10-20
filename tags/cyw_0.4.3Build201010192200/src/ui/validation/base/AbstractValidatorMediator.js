with(this){
(function(){
   function AbstractValidatorMediator(validator){
      this.validator = validator
      this.registerAsObserver()
   }
   
   AbstractValidatorMediator.prototype = {
      constructor: AbstractValidatorMediator,
      AbstractValidatorMediator: AbstractValidatorMediator,
      
      handleEvent: function(event){
         if(event.newValue)
            this.isValid()
         else
            this.isInvalid()
      },
      
      isValid: function(){
         throw new Error('must be implemented')
      },
      
      isInvalid: function(){
         throw new Error('must be implemented')
      },
      
      registerAsObserver: function(){
         this.validator.addValidStateChangedListener(this)
      }
      
   }
   
   this.AbstractValidatorMediator = AbstractValidatorMediator;
}).apply(this)
}