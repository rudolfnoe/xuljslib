with(this){
(function(){
   function ElementActivationValidationMediator(validator, dependantElements){
      this.AbstractValidatorMediator(validator)
      this.dependantElements = new ArrayList(DomUtils.getElements(dependantElements))
   }
   
   ElementActivationValidationMediator.prototype = {
      constructor: ElementActivationValidationMediator,
      
      addDependantElement: function(element){
         this.dependantElements.add(element)
      },
      
      isValid: function(){
         this.setDisabled(false)
      },
      
      isInvalid: function(){
         this.setDisabled(true)
      },
      
      setDisabled: function(disabled){
         for (var i = 0;i < this.dependantElements.size(); i++) {
            this.dependantElements.get(i).disabled=disabled
         }
      }
      
   }
   
   ObjectUtils.extend(ElementActivationValidationMediator, "AbstractValidatorMediator", this)

   this.ElementActivationValidationMediator = ElementActivationValidationMediator;
}).apply(this)
}