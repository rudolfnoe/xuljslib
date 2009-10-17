with(this){
(function(){
   
   function GenericValidator(condition, valueObserver){
      this.AbstractValidator()
      this.condition = condition
      this.valueObserver = valueObserver
      this.registerAsValueChangedListener()
   }
   
   GenericValidator.prototype = {
      constructor: GenericValidator,
      
      isValid: function(){
         return this.condition.isValid(this.valueObserver.getValue())   
      },
      
      handleEvent: function(){
         this.validate()
      },
      
      registerAsValueChangedListener: function(){
         this.valueObserver.addValueChangedListener(this)   
      }
   }

   ObjectUtils.extend(GenericValidator, "AbstractValidator", this)
   
   this.GenericValidator = GenericValidator;
}).apply(this)
}