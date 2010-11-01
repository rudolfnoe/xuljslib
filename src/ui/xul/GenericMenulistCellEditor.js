with(this){
(function(){
   function GenericMenulistCellEditor(menulist){
      this.menulist = menulist
      if(menulist.parentNode)
         DomUtils.removeElement(menulist)
   }
   
   GenericMenulistCellEditor.prototype = {
      constructor: GenericMenulistCellEditor,
      
      getEditingElement: function(){
         return this.menulist
      },
      
      
      getValue: function(){
         return this.menulist.value
      },
      
      getLabel: function(){
         if(this.menulist.editable){
            return this.menulist.inputField.value
         }else{
            return this.menulist.selectedItem.label
         }
      },    
      
      //Called after editing element is inserted in the DOM
      initEditingElement: function(currentItem){
         this.menulist.value = currentItem.value
         //As edit element is not in DOM yet the property editable is not set
         if(this.menulist.getAttribute('editable')=="true")
            this.menulist.inputField.value = currentItem.value
      },
      
      hasValue: function(){
         return !StringUtils.isEmpty(this.getValue())   
      }
   }

   this.GenericMenulistCellEditor = GenericMenulistCellEditor;
}).apply(this)
}