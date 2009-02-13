with(this){
(function(){
   function NotEmptyCondition(){
   }
   
   NotEmptyCondition.prototype = {
      constructor: NotEmptyCondition,

      isValid: function(value){
         return !StringUtils.isEmpty(value)
      }
      
   }

   ObjectUtils.extend(NotEmptyCondition, "ICondition", this)
   
   this.NotEmptyCondition = NotEmptyCondition;
}).apply(this)
}