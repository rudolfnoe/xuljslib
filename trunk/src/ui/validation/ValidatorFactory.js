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
      },
      
      createRadioGroupSelectionValidator: function(radiogroup, selectedValue){
         return new GenericValidator(new RegExpCondition(new RegExp("asdf")), new RadiogroupValueObserver(radiogroup))
      }
   }

   this.ValidatorFactory = ValidatorFactory;
}).apply(this)
}