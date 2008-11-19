with(this){
(function(){
   var CssUtils = {
      convertCssPropNameToCamelCase: function(cssPropName){
         var result = null
         var parts = cssPropName.split("-")
         for (var i = 0; i < parts.length; i++) {
            result += StringUtils.firstUpper(parts[i])
         }
      }
   }

   this.CssUtils = CssUtils;
}).apply(this)
}