with(this){
(function(){
   function RegExpCondition(regExp){
      this.regExp = regExp
   }
   
   RegExpCondition.prototype = {
      constructor: RegExpCondition,

      isValid: function(value){
         return this.regExp.test(value)
      }
      
   }

   ObjectUtils.extend(RegExpCondition, "ICondition", this)
   
   this.RegExpCondition = RegExpCondition;
}).apply(this)
}