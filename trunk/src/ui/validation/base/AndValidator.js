with(this){
(function(){
   function AndValidator(validatorsArr){
      this.AbstractContainerValidator(validatorsArr)
   }
   
   AndValidator.prototype = {
      constructor: AndValidator,
      
      isValid: function(){
         for (var i = 0;i < this.getValidators().size(); i++) {
            if(!this.getValidators().get(i).isValid())
               return false
         }
         return true
      }
   }
   
   ObjectUtils.extend(AndValidator, "AbstractContainerValidator", this)

   this.AndValidator = AndValidator;
}).apply(this)
}