with(this){
(function(){
   function AbstractContainerTreeItem(open){
      this.AbstractTreeItem()
      this.children = new ArrayList()
      if(arguments.length>=1)
         this.containerOpen = open
      else  
         this.containerOpen = true
   }
   
   AbstractContainerTreeItem.prototype = {
      constructor: AbstractContainerTreeItem,
      AbstractContainerTreeItem: AbstractContainerTreeItem,

      addChild: function(abstractTreeItem){
         abstractTreeItem.setParent(this)
         abstractTreeItem.setLevel(this.getLevel()+1)
         this.children.add(abstractTreeItem)         
      },
      
      getCellText : function(column) {
         throw new Error ('Not implemented')
      },

      getChildren: function(){
         return this.children
      },
      
      getChildCount: function(){
         return this.children.size()
      },
      
      getDescendants: function(){
         function addChildren(abstractTreeItem, arrayList){
            if(abstractTreeItem.isContainer()){
               var children = abstractTreeItem.getChildren()
               for (var i = 0;i < children.size(); i++) {
                  var child = children.get(i)
                  arrayList.add(child)
                  addChildren(child, arrayList)            
               }
            }
         }
         var result = new ArrayList()
         addChildren(this, result)
         return result            
      },
      
      getNextSibling: function(item){
         Assert.paramsNotNull(arguments)
         Assert.isTrue(item.getParent()==this, "Wrong parent for item")
         var index = this.children.indexOf(item)
         if(index==this.children.size()-1){
            return null
         }else{
            return this.children.get(index+1)
         }
      },
      
      getPreviousSibling: function(item){
         Assert.paramsNotNull(arguments)
         Assert.isTrue(item.getParent()==this, "Wrong parent for item")
         var index = this.children.indexOf(item)
         if(index==0){
            return null
         }else{
            return this.children.get(index-1)
         }
      },

      getVisibleDescendants: function(){
         function addVisibleChildren(abstractTreeItem, arrayList){
            if(abstractTreeItem.isContainer() && abstractTreeItem.isContainerOpen()){
               var children = abstractTreeItem.getChildren()
               for (var i = 0;i < children.size(); i++) {
                  var child = children.get(i)
                  arrayList.add(child)
                  addVisibleChildren(child, arrayList, false)            
               }
            }
         }
         var result = new ArrayList()
         addVisibleChildren(this, result)
         return result
      },
      
      getVisibleDescendantsCount: function(){
         return this.getVisibleDescendants().size()
      },
      
      hasNextSibling: function(item){
         return this.getNextSibling(item)!=null
      },

      isContainer: function(){
         return true
      },
      
      isContainerEmpty: function(row){
         return this.children.size()==0
      },

      isContainerOpen: function(row){
         return this.containerOpen
      },
      
      removeChild: function(abstractTreeItem){
         abstractTreeItem.setParent(null)
         return this.children.remove(abstractTreeItem)
      },

      setContainerOpen: function(containerOpen){
         this.containerOpen = containerOpen
      },
      
      setLevel: function(level){
         this.level = level
         for (var i = 0;i < this.children.size(); i++) {
            this.children.get(i).setLevel(level+1)
         }
      },
      
      swapItems: function(item1, item2){
         Assert.isTrue(item1.parent==this, "Item has not matching parent")
         Assert.isTrue(item2.parent==this, "Item has not matching parent")
         var index1 = this.children.indexOf(item1)
         var index2 = this.children.indexOf(item2)
         this.children.set(index2, item1)
         this.children.set(index1, item2)
      }
      
      
   }
   
   ObjectUtils.extend(AbstractContainerTreeItem, "AbstractTreeItem", this)

   this.AbstractContainerTreeItem = AbstractContainerTreeItem;
}).apply(this)
}