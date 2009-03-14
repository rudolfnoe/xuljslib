with(this){
(function(){
	
	function AbstractTreeView(tree, rootItem) {
      this.GenericEventSource()
		this.tree = tree
      this.visibleItems = new ArrayList()
      if(arguments.length>=2){
         if(!rootItem.isContainer())
            throw new Error('root item must be container')
         this.rootItem = rootItem
         this.visibleItems.add(rootItem)
         //Set level to -1 so that children are displayed on level 0
         this.rootItem.setLevel(0)
   		this.rowCount = 1
      }else{
         //Create Default root container but don't show it
         this.rootItem = new DefaultContainerTreeItem()
         //Set level to -1 so that children are displayed on level 0
         this.rootItem.setLevel(-1)
   		this.rowCount = 0
      }
      this.treebox = null
		//self registration of the view at the tree
      //so this hasn't to be done outside
		this.tree.view = this
	}
	
	AbstractTreeView.prototype = {
		constructor: AbstractTreeView,
      AbstractTreeView: AbstractTreeView,

      getRootItem: function(){
         return this.rootItem
      },
      getVisibleItems: function(){
         return this.visibleItems
      },
      getTreeBox: function(){
         return this.treebox
      },
      addItem: function(item, parent){
         if(parent==null)
            var parent = this.getRootItem()
         Assert.isTrue(parent.isContainer(), 'Parent is no container')
         //first add child to parent!
         parent.addChild(item)
         this.notifyListeners({type:"add", item:item})
         //then ajust visible items
         if(parent.isVisible() && parent.isContainerOpen()){
            var insertIndex = this.getIndexForItem(parent) + parent.getVisibleDescendantsCount() 
            if(item.isContainer()){
               insertIndex -= item.getVisibleDescendantsCount()
            }
            var itemsToAdd = new ArrayList()
            itemsToAdd.add(item)
            if(item.isContainer()){
               itemsToAdd.addAll(item.getVisibleDescendants())
            }
   			this.visibleItems.addAllAtIndex(insertIndex, itemsToAdd)
   			this.rowCountChanged(this.insertIndex, itemsToAdd.size())
         }
      },
      closeContainer: function(item, row){
         Assert.isTrue(item.isContainer(), "closeContainer called on non-container item")
         if(!item.isContainerOpen()){
            return
         }
         if(!row){
            row = this.getIndexForItem(item)
         }
         var visibleDescendantsCount = item.getVisibleDescendantsCount()
         var startIndex = row+1
         var endIndex = row + visibleDescendantsCount
         this.visibleItems.removeRange(startIndex, endIndex)
         this.rowCountChanged(row+1, -visibleDescendantsCount)
         //Must be called last as otherwise getVisibleDescendantsCount returns wrong result
         item.setContainerOpen(false)
      },
      filter: function(filterExp){
         this.iterateTree(function(item){
            var columns = this.tree.columns
            for (var i = 0; i < columns.length; i++) {
               var cellText = item.getCellText(columns.getColumnAt(i))
               if(StringUtils.matches(cellText, "*"+filterExp)){
                  item.setFiltered(false)
                  break
               }else{
                  item.setFiltered(true)
               }
            }
         })
         var oldSize = this.visibleItems.size()
         this.visibleItems.clear()
         this.treebox.rowCountChanged(0, -oldSize)
         this.iterateTree(function(item){
            if(!item.getFiltered()){
               this.visibleItems.add(item)
            }
         })
         this.treebox.rowCountChanged(0, this.visibleItems.size())
      },
		getCellProperties : function(row, col, props) {
         //TODO
		},
		getCellText : function(row, column) {
         return this.visibleItems.get(row).getCellText(column)
		},
		getCellValue : function(row, column) {
         return this.visibleItems.get(row).getCellValue(column)
		},
		setCellValue : function(row, column, value) {
         return this.visibleItems.get(row).setCellValue(column, value)
		},
		getColumnProperties : function(colid, col, props) {
         //TODO
		},
		getImageSrc : function(row, col) {
         return this.visibleItems.get(row).getImageSrc(col)
		},
      getIndexForItem: function(aItem){
         for (var i = 0; i < this.visibleItems.size(); i++) {
            var item = this.visibleItems.get(i)
            if(item==aItem)
               return i
         }
         return -1
      },
      getVisibleItem: function(row){
         return this.visibleItems.get(row) 
      },
		getLevel : function(row) {
         return this.visibleItems.get(row).getLevel()
		},
      getParentIndex:function(row){
         var startLevel = this.getVisibleItem(row).getLevel()
         for(var i=row; i >= 0; i--){
            var otherLevel = this.getVisibleItem(i).getLevel()
            if(otherLevel<startLevel)
               return i
         }
         return -1
      },
		getRowProperties : function(row, props) {
         //TODO
		},
      getSelectedIndex: function(){
         return this.tree.currentIndex
      },
      getSelectedItem: function(){
         if(this.tree.currentIndex==-1)
            return null
         else
            return this.visibleItems.get(this.tree.currentIndex)
      },
      hasNextSibling: function(row, afterIndex){
         var item = this.getVisibleItem(row)
         if(item == this.getRootItem()){
            return false
         }else{
            return item.getParent().hasNextSibling(item)
         }
      },
      invalidateRow: function(indexOrItem){
         var index = indexOrItem
         if(isNaN(indexOrItem))
            index = this.getIndexForItem(indexOrItem)
         if(index==-1)
            throw new Error("Row for param " + indexOrItem + " not found")
         this.getTreeBox().invalidateRow(index)
            
      },
		isContainer : function(row) {
         return this.visibleItems.get(row).isContainer()
		},
      isContainerEmpty: function(row){
      	return this.visibleItems.get(row).isContainerEmpty()
      },
      isContainerOpen: function(row){
      	return this.visibleItems.get(row).isContainerOpen()
      },
		isEditable: function(row, column){
         return false   
      },
      isSeparator : function(row) {
         return this.visibleItems.get(row).isSeparator()
		},
		isSorted : function() {
         //TODO
			return false;
		},
      iterateTree: function(callBackFunction, skipRoot){
         function iterateItem(item, skipRoot){
            if(!skipRoot  || item!=this.rootItem)
               callBackFunction.apply(this, [item])
            if(item.isContainer()){
               var children = item.getChildren()
               for (var i = 0; i < children.size(); i++) {
                  iterateItem.apply(this, [children.get(i)])
               }
            }
         }
         iterateItem.apply(this, [this.getRootItem(), skipRoot])
      },
      notifyUpdate: function(item){
         this.notifyListeners({type:"update", item:item})
         this.invalidateRow(item)
      },
      openContainer: function(item, row){
         Assert.isTrue(item.isContainer(), "openContainer called on non-container item")
         if(item.isContainerOpen()){
            return
         }
         //Must be first as otherwise getVisibleDescendantsCount returns wrong result
         item.setContainerOpen(true)
         if(!row){
            var row = this.getIndexForItem(item)
         }
         var visibleDescendants = item.getVisibleDescendants()
         this.visibleItems.addAllAtIndex(row+1, visibleDescendants)
         this.rowCountChanged(row+1, visibleDescendants.size()) 
      },
      removeItem: function(item){
         Assert.paramsNotNull(arguments)
         Assert.isTrue(item.getParent() != null, 'Root cannot be removed')
         item.getParent().removeChild(item)
         if(item.isVisible()){
            var index = this.getIndexForItem(item)
            var removedItemsCount = 1
            if(item.isContainer()){
               var visibleDescendantsCount = item.getVisibleDescendants().size()
               this.visibleItems.removeRange(index, index+visibleDescendantsCount)
               removedItemsCount += visibleDescendantsCount
            }else{
      			this.visibleItems.removeAtIndex(index)
            }
            this.notifyListeners({type:"remove", item:item})
   			this.rowCountChanged(index, -removedItemsCount)
         }
         return item
      },
      removeSelected: function(selectNext){
         if(this.tree.currentIndex==-1)
            return
         var selectedIndex = this.getSelectedIndex()
         var removedItem = this.removeItem(this.getSelectedItem())
         if(!selectNext || this.rowCount==0)
            return
         if(selectedIndex>=this.rowCount)
            selectedIndex--
         this.setSelected(selectedIndex)
         return removedItem
      },
		rowCountChanged: function(index, count){
      	if(this.treebox==null)
      	  return
         this.updateRowCount()
      	this.treebox.rowCountChanged(index, count)
      },
      setSelected: function(index){
         this.selection.select(index)
      },
      setSelectedItem: function(item){
         this.selection.select(this.getIndexForItem(item))
      },
		setTree : function(treebox) {
			this.treebox = treebox;
		},
      swapItems: function(item1, item2){
         Assert.paramsNotNull(arguments)
         Assert.notNull(item1.getParent())
         Assert.notNull(item2.getParent())
         Assert.isTrue(item1.getParent()==item2.getParent())
         item1.getParent().swapItems(item1, item2)
         //Update view by building up completly new
         var newVisibleItems = this.getRootItem().getVisibleDescendants()
         newVisibleItems.addAtIndex(0, this.getRootItem())
         this.visibleItems = newVisibleItems
         this.getTreeBox().invalidate()
      },
		updateRowCount: function(){
			this.rowCount = this.visibleItems.size()
		},
      toggleOpenState: function(row){
         var item = this.getVisibleItem(row)
         if(!item.isContainer)
         	throw new Error('toggleOpenState called for non-container')
         if(item.isContainerOpen()){
            this.closeContainer(item, row)
         }else{
            this.openContainer(item, row)
         }
      }
	}
   ObjectUtils.extend(AbstractTreeView, "GenericEventSource", this)
	this["AbstractTreeView"] = AbstractTreeView;
}).apply(this)
}