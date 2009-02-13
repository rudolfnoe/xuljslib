with(this){
(function(){
   var ValidatorFactory = {
      createTextboxNotEmptyValidator: function(textbox){
         return new GenericValidator(new NotEmptyCondition(), new TextboxValueObserver(textbox))
      }
   }

   this.ValidatorFactory = ValidatorFactory;
}).apply(this)
}