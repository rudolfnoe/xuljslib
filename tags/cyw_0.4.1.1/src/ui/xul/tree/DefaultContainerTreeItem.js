with(this){
(function(){
   /*
    * Used as Root element
    */
   function DefaultContainerTreeItem(cellText){
      this.AbstractContainerTreeItem(true)
      this.cellText = StringUtils.defaultString(cellText,"")
   }
   
   DefaultContainerTreeItem.prototype = {
      constructor: DefaultContainerTreeItem,
      
      getCellText: function(column){
         return this.cellText
      }
   }
   
   ObjectUtils.extend(DefaultContainerTreeItem, "AbstractContainerTreeItem", this)

   this.DefaultContainerTreeItem = DefaultContainerTreeItem;
}).apply(this)
}