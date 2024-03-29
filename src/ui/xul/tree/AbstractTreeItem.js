with(this){
(function(){
   function AbstractTreeItem (){
      this.filtered = false
      this.level = 0
      this.parent = null
      this.imageSrc = null
   }
   
   AbstractTreeItem.prototype = {
      constructor: AbstractTreeItem,
      AbstractTreeItem: AbstractTreeItem,

      getFiltered: function(){
         return this.filtered
      },

      setFiltered: function(filtered){
         this.filtered = filtered
      },

      getLevel: function(){
         return this.level
      },

      setLevel: function(level){
         this.level = level
      },
      
      getCellText : function(column) {
         throw new Error ('Not implemented')
      },

      getCellValue: function(column) {
         throw new Error ('Not implemented')
      },

      setCellValue: function(column, value) {
         throw new Error ('Not implemented')
      },

      getImageSrc: function(){
         return this.imageSrc
      },

      setImageSrc: function(imageSrc){
         this.imageSrc = imageSrc
      },
      
      getParent: function(){
         return this.parent
      },

      setParent: function(parent){
         this.parent = parent
      },
      
      compareTo: function(other, column){
         var thisCellText = this.getCellText(column)
         var otherCellText = other.getCellText(column)
         if(thisCellText==null && otherCellText==null){
            return null
         }else if(thisCellText!=null && otherCellText==null){
            return 1
         }else if (thisCellText==null && otherCellText!=null){
            return -1
         }else if(thisCellText == otherCellText){
            return 0
         }else{
            return thisCellText > otherCellText ? 1 : 0    
         }
      },
      
      clone: function(){
         throw new Error('Must be implmeneted')
      },
      
      isContainer : function() {
         throw new Error('Must be implmeneted')
      },
      
      isSeparator : function() {
         return false
      },
      
      isVisible: function(){
         var treeItem = this
         while(treeItem = treeItem.getParent()){
            if(!treeItem.isContainerOpen())
               return false
         }
         return true
      },
      
      superClone: function(){
         return ObjectUtils.deepClone(this)   
      }
   }

   this["AbstractTreeItem"] = AbstractTreeItem;
}).apply(this)
}