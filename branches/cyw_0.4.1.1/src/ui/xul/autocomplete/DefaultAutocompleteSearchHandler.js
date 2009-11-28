with(this){
(function(){
   function DefaultAutocompleteSearchHandler(itemsArray){
      this.itemsArray = itemsArray
   }
   
   DefaultAutocompleteSearchHandler.prototype = {
      constructor: DefaultAutocompleteSearchHandler,
      
      determinePrefixData: function(value, selectionEnd){
         var prefixData = {
            afterPrefix: "",
            beforePrefix: "",
            prefix: ""
         }
         if(selectionEnd==0){
            return prefixData
         }
         var lastSpaceIndex = value.lastIndexOf(" ", selectionEnd)
         if(lastSpaceIndex==-1){
            prefixData.prefix = value.substring(0, selectionEnd)
         }else{
            prefixData.prefix = value.substring(lastSpaceIndex+1, selectionEnd)
            prefixData.beforePrefix = value.substring(0, lastSpaceIndex+1)
         }
         if(selectionEnd<value.length-1){
            prefixData.afterPrefix = value.substring(selectionEnd)
         }
         return prefixData
      },
      
      search: function(value, selectionStart, selectionEnd){
         Assert.paramsNotNull(arguments)
         var prefixData = this.determinePrefixData(value, selectionEnd)
         var searchResults = []
         var prefix = prefixData.prefix.toLowerCase() 
         for (var i = 0; i < this.itemsArray.length; i++) {
            var item = this.itemsArray[i]
            if(StringUtils.startsWith(item.toLowerCase(), prefix) && item!=prefix){
               var value = prefixData.beforePrefix + item + prefixData.afterPrefix
               var selectionShift = item.length - prefix.length
               searchResults.push(new SearchResultEntry(item, value, 
                                                         selectionStart + selectionShift, 
                                                         selectionEnd + selectionShift))
               
            }
         }
         return searchResults
      }
      
   }

   this.DefaultAutocompleteSearchHandler = DefaultAutocompleteSearchHandler;
}).apply(this)
}