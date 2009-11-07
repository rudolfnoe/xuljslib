with(this){
(function(){
   function NotEmptyCondition(){
   }
   
   NotEmptyCondition.prototype = {
      constructor: NotEmptyCondition,

      isValid: function(value){
         return value != null && !StringUtils.isEmpty(StringUtils.trim(value))
      }
      
   }

   ObjectUtils.extend(NotEmptyCondition, "ICondition", this)
   
   this.NotEmptyCondition = NotEmptyCondition;
}).apply(this)
}