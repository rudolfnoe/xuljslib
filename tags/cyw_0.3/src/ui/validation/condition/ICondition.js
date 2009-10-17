with(this){
(function(){
   function ICondition(){
      throw new Error('could not be instantiated')
   }
   
   ICondition.prototype = {
      constructor: ICondition,
      
      isValid: function(value){
         throw new Error('must be implemented')
      }
   }

   this.ICondition = ICondition;
}).apply(this)
}