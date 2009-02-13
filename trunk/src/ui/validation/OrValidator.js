with(this){
(function(){
   function OrValidator(){
      this.AbstractContainerValidator()
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