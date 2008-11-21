with(this){
(function(){
   function AbstractGenericTreeItem (){
   }
   
   AbstractGenericTreeItem.prototype = {
   	AbstractGenericTreeItem: function(level){
   		this.level = level
   	},
      getCellText : function(column) {
         throw new Error ('Not implemented')
      },
      isContainer : function() {
         return false
      },
      isSeparator : function() {
         return false
      },
      getLevel : function() {
         return this.level
      },
      getImageSrc : function(col) {
         return null
      }
      
   }

   this["AbstractGenericTreeItem"] = AbstractGenericTreeItem;
}).apply(this)
}