with(this){
(function(){
   function AbstractContainerValidator(){
      this.AbstractValidator()
      this.validators = new ArrayList()
   }
   
   AbstractContainerValidator.prototype = {
      constructor: AbstractContainerValidator,
      AbstractContainerValidator: AbstractContainerValidator,
      
      addValidator: function(validator){
         this.validators.add(validator)
         validator.addValidStateChangedListener(this)
      },
      
      getValidators: function(){
         return this.validators
      },

      isValid: function(){
         throw new Error('must be implemented')
      },

      handleEvent: function(event){
         this.validate()
      }
      
   }
   
   ObjectUtils.extend(AbstractContainerValidator, "AbstractValidator", this)

   this.AbstractContainerValidator = AbstractContainerValidator;
}).apply(this)
}