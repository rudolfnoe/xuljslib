with(this){
(function(){
   function AbstractContainerValidator(validatorArr){
      this.AbstractValidator()
      this.validators = new ArrayList()
      if(validatorArr){
         this.addValidators(validatorArr)
      }
   }
   
   AbstractContainerValidator.prototype = {
      constructor: AbstractContainerValidator,
      AbstractContainerValidator: AbstractContainerValidator,
      
      addValidator: function(validator){
         this.addValidators([validator])
      },
      
      addValidators: function(validatorArr){
         this.validators.addAll(validatorArr)
         for (var i = 0; i < validatorArr.length; i++) {
            validatorArr[i].addValidStateChangedListener(this)
         }
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