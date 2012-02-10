with(this){
(function(){
   /*
    * Wraps multiple DOM elements for doing and undoing any kind of modifications to it
    * @param DOMElements[] elementArray: array of elements which will be wrapped
    */
   function MultiElementWrapper(elementArray){
      if(elementArray!=null){
         for (var i = 0; i < elementArray.length; i++) {
            this.elementWrappers.push(new ElementWrapper(elementArray[i], true))
         }
      }
   }
   
   MultiElementWrapper.prototype = {
      elementWrappers: [],
      constructor: MultiElementWrapper,
      
      doForEachWrapper: function(functionName, arg1, arg2, arg3){
         this.elementWrappers.forEach(function(wrapper){
            wrapper[functionName](arg1, arg2, arg3);
         }) 
      },
      
      getChangeMemento: function(){
         var changeMemento = new Array(this.elementsWrappers.length)
         for (var i = 0; i < this.elementWrappers.length; i++) {
            changeMemento[i] = this.elementWrappers[i].getChangeMemento()
         }
         return changeMemento
      },
      setChangeMemento: function(changeMemento){
         this.elementWrappers.forEach(function(wrapper, i){
            wrapper.setChangeMemento(changeMemento[i])
         }) 
      },
      restore: function(){
         this.doForEachWrapper("restore")
      },
      restoreProperty: function(prop){
         this.doForEachWrapper("restoreProperty", prop)
      },
      restoreProperties: function(){
         this.doForEachWrapper("restoreProperties")
      },
      restoreStyle: function(){
         this.doForEachWrapper("restoreStyle")
      },
      restoreStyleProperty: function(prop){
         this.doForEachWrapper("restoreStyleProperty", prop)
      },
      setProperty: function(prop, value){
         this.doForEachWrapper("setProperty", prop, value)
      },
      setStyle: function(prop, value, priority){
         this.doForEachWrapper("setStyle", prop, value, priority)
      },
      setCss: function(cssText, overwriteExisiting){
         this.doForEachWrapper("setCss", cssText, overwriteExisiting)
      }
   }

   this.MultiElementWrapper = MultiElementWrapper;
}).apply(this)
}