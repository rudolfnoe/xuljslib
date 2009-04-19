with(this){
(function(){
   var ValidatorFactory = {
      
      createKeyInputboxNotEmptyValidator: function(keyInputbox){
         return new KeyInputboxNotEmptyValidator(keyInputbox)
      },
      
      createShortStringInputboxNotEmptyValidator: function(shortstringInputbox){
         return new ShortStringInputboxValidator(shortstringInputbox)   
      },
      
      createTextboxNotEmptyValidator: function(textbox){
         return new GenericValidator(new NotEmptyCondition(), new TextboxValueObserver(textbox))
      }
      
      
   }

   this.ValidatorFactory = ValidatorFactory;
}).apply(this)
}