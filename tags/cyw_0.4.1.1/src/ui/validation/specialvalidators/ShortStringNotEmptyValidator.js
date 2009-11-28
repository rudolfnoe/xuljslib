with(this){
(function(){
   function ShortStringInputboxValidator(shortStringInputbox){
      this.AbstractValidator()
      this.shortStringInputbox = shortStringInputbox
      this.registerListener()
   }
   
   ShortStringInputboxValidator.prototype = {
      constructor: ShortStringInputboxValidator,   
      
      isValid:  function(){
         return this.shortStringInputbox.value.length > 0
      },
      
      registerListener: function(){
         this.shortStringInputbox.addValueChangeListener(this.validate, this)   
      }
   }
   
   ObjectUtils.extend(ShortStringInputboxValidator, "AbstractValidator", this)
   
   this.ShortStringInputboxValidator = ShortStringInputboxValidator;
}).apply(this)
}