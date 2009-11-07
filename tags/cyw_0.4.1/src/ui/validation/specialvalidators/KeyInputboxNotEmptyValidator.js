with(this){
(function(){
   function KeyInputboxNotEmptyValidator(keyInputbox){
      this.AbstractValidator()
      this.keyInputbox = keyInputbox
      this.registerListener()
   }
   
   KeyInputboxNotEmptyValidator.prototype = {
      constructor: KeyInputboxNotEmptyValidator,   
      
      isValid:  function(){
         return this.keyInputbox.isSet()
      },
      
      registerListener: function(){
         this.keyInputbox.addValueChangeListener(this.validate, this)   
      }
   }
   
   ObjectUtils.extend(KeyInputboxNotEmptyValidator, "AbstractValidator", this)
   
   this.KeyInputboxNotEmptyValidator = KeyInputboxNotEmptyValidator;
}).apply(this)
}