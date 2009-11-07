with(this){
(function(){
   function SearchResultEntry(text, value, selectionStart, selectionEnd){
      this.text = text
      this.value = value
      this.selectionStart = selectionStart
      this.selectionEnd = selectionEnd
   }
   
   SearchResultEntry.prototype = {
      constructor: SearchResultEntry,
      
      getSelectionStart: function(){
         return this.selectionStart
      },
      
      getSelectionEnd: function(){
         return this.selectionEnd
      },
      
      getText: function(){
         return this.text
      },

      getValue: function(){
         return this.value
      }
      
   }

   this.SearchResultEntry = SearchResultEntry;
}).apply(this)
}