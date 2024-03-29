with(this){
(function(){
	
	function AbstractTreeView(tree, rootItem, isSortable) {
      this.GenericEventSource()
      this.isSortable = isSortable
		this.tree = tree
      //Will be automaticall set as nsITreeSelection by the tree 
      this.selection = null 
      this.visibleItems = new ArrayList()
      if(rootItem!=null){
         if(!rootItem.isContainer())
            throw new Error('root item must be container')
         this.rootItem = rootItem
         this.showRoot = true
         this.visibleItems.add(rootItem)
         this.rootItem.setLevel(0)
   		this.rowCount = 1
      }else{
         //Create Default root container but don't show it
         this.rootItem = new DefaultContainerTreeItem()
         this.showRoot = false
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
      getTree: function(){
         return this.tree
      },
      getTreeBox: function(){
         return this.treebox
      },
      addItem: function(item, parent, index){
         if(parent==null)
            var parent = this.getRootItem()
         Assert.isTrue(parent.isContainer(), 'Parent is no container')
         //first add child to parent!
         if(arguments.length>=3){
            parent.addChildAtIndex(item, index)
         }else{
            parent.addChild(item)
         }
         this.notifyListeners({type:"add", item:item})
         //then ajust visible items
         if(parent.isVisible() && parent.isContainerOpen()){
            var insertIndex = this.getIndexForItem(parent) + parent.getVisibleIndexOfChild(item) + 1 
            var itemsToAdd = new ArrayList()
            itemsToAdd.add(item)
            if(item.isContainer()){
               itemsToAdd.addAll(item.getVisibleDescendants())
            }
   			this.visibleItems.addAllAtIndex(insertIndex, itemsToAdd)
   			this.rowCountChanged(insertIndex, itemsToAdd.size())
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
      cycleHeader: function(column){
         if(!this.isSortable){
            return
         }
         var cyleHeaderCol = column.element
         var currentSortDirection = cyleHeaderCol.getAttribute("sortDirection")
         
         var columns = this.tree.columns
         for (var i = 0; i < columns.length; i++) {
            var col = columns.getColumnAt(i).element 
            col.setAttribute("sortActive", "false")
            col.setAttribute("sortDirection", SortDirection.NONE)
         }
         
         cyleHeaderCol.setAttribute("sortActive", "true")
         var newSortDirection = currentSortDirection==SortDirection.ASCENDING?SortDirection.DESCENDING:SortDirection.ASCENDING 
         cyleHeaderCol.setAttribute("sortDirection", newSortDirection)
         this.sort(column, newSortDirection)
      },
      filter: function(filterExp){
         this.iterateTree(function(item){
            var columns = this.tree.columns
            for (var i = 0; i < columns.length; i++) {
               var cellText = item.getCellText(columns.getColumnAt(i))
               if(StringUtils.matches(cellText, "*"+filterExp, true)){
                  item.setFiltered(false)
                  break
               }else{
                  item.setFiltered(true)
               }
            }
         }, true)
         var oldSize = this.visibleItems.size()
         this.visibleItems.clear()
         if(this.showRoot){
            this.visibleItems.add(this.getRootItem())
         }
         //invalidate does not work!
         this.treebox.rowCountChanged(0, -oldSize)
         this.iterateTree(function(item){
            if(!item.getFiltered()){
               this.visibleItems.add(item)
            }
         }, true)
         this.updateRowCount()
         this.defaultSort()
         this.treebox.rowCountChanged(0, this.visibleItems.size())
      },
		getCellProperties : function(row, col, props) {
         //ENHANCEMENT Not implemented
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
         //ENHANCEMENT Not implemented
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
      getVisibleRowCount: function(){
         return this.rowCount
      },
		getRowProperties : function(row, props) {
         //ENHANCEMENT Not implemented
		},
      getSelectedIndex: function(){
         return this.tree.currentIndex
      },
      getSelectedIndices : function() {
			var rangeStart = {} 
         var rangeEnd = {}
         var selectedIndices = [];
         var rangeCount = this.selection.getRangeCount()

			for (var i = 0; i < rangeCount; i++) {
				this.selection.getRangeAt(i, rangeStart, rangeEnd);
				for (var j = rangeStart.value; j <= rangeEnd.value; j++)
					selectedIndices.push(j);
			}
         return selectedIndices
		},         
      getSelectedItem: function(){
         var selectedItems = this.getSelectedItems()
         return selectedItems.length>0?selectedItems[0]:null
      },
      getSelectedItems: function(){
         var selectedIndices = this.getSelectedIndices()
         var selectedItems = []
         for(var i=0; i<selectedIndices.length; i++){
            selectedItems.push(this.visibleItems.get(selectedIndices[i]))
         }
         return selectedItems
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
         //ENHANCEMENT Not implemented
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
         var removedItems = []
         var selectedIndex = this.getSelectedIndex() 
         if(selectedIndex==-1)
            return removedItems
         var removedItems = this.getSelectedItems()
         var newSelectedIndex = selectedIndex-removedItems.length+1
         for (var i = 0; i < removedItems.length; i++) {
            var removedItem = this.removeItem(removedItems[i])
         }
         if(selectNext && this.rowCount>0){
            if(newSelectedIndex>=this.rowCount){
               newSelectedIndex = this.rowCount-1
            }
            this.setSelected(newSelectedIndex)
         }
         return removedItems
      },
      replaceItem: function(newItem, oldItem){
         Assert.paramsNotNull(arguments)
         Assert.notNull(oldItem.getParent(), "Parent of old item is null")
         oldItem.getParent().replaceChild(newItem, oldItem)
         var indexOfOldItem = this.getIndexForItem(oldItem)
         if(indexOfOldItem!=-1){
            this.visibleItems.set(indexOfOldItem, newItem)
            this.invalidateRow(indexOfOldItem)
         }
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
      sort: function(column, sortDirection){
         Assert.paramsNotNull(arguments)
         if(sortDirection==SortDirection.ASCENDING){
            this.visibleItems.sort(function(a, b){
               return a.compareTo(b, column)
            })
         }else if(sortDirection==SortDirection.DESCENDING){
            this.visibleItems.sort(function(a, b){
               return b.compareTo(a, column)
            })
         }else{
            Assert.fail('wrong sortDirection')
         }
         this.getTreeBox().invalidate()
      },
      defaultSort: function(){
         var columns = this.tree.columns
         //no shortcut possible as code must also run within binding
         var sortedColumn = null
         for (var i = 0; i < columns.length; i++) {
            if(columns[i].element.getAttribute('sortActive')=="true"){
               sortedColumn = columns[i]
               break
            }
         }
         if(!sortedColumn){
            return
         }
         var sortDirection = sortedColumn.element.hasAttribute('sortDirection')?
                                 sortedColumn.element.getAttribute('sortDirection'):SortDirection.ASCENDING
         this.sort(sortedColumn, sortDirection)
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
   
   SortDirection = {
      ASCENDING: "ascending",
      DESCENDING: "descending",
      NONE: "none"
   }
}).apply(this)
}