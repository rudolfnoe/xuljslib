with(this){
(function(){
   function IAutocompleateSearchHandler(){
      
   }
   
   IAutocompleateSearchHandler.prototype = {
      constructor: IAutocompleateSearchHandler,
      
      search: function(value, selectionStart, SelectionEnd){
         Assert.fail("Must be implemented")
      }
      
   }

   this.IAutocompleateSearchHandler = IAutocompleateSearchHandler;
}).apply(this)
}