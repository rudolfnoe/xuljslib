with(this){
(function(){
   function OrValidator(validatorArr){
      this.AbstractContainerValidator()
      if(validatorArr){
         this.addValidators(validatorArr)
      }
   }
   
   OrValidator.prototype = {
      constructor: OrValidator,
      
      isValid: function(){
         for (var i = 0;i < this.getValidators().size(); i++) {
            if(this.getValidators().get(i).isValid())
               return true
         }
         return false
      }
   }
   
   ObjectUtils.extend(OrValidator, "AbstractContainerValidator", this)

   this.OrValidator = OrValidator;
}).apply(this)
}