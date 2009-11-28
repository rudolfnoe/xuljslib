with(this){
(function(){
   /*
    * Wraps an DOM element for doing and undoing any kind of modifications ot it
    * @param DOMElement element: element which will be wrapped
    * @param optional boolean backupChanges: if true changes will be backup for later undoing, default=true
    */
   function ElementWrapper(element, backupChanges){
      if(!element || element.nodeType!=1 || !element.style)
         throw Error ("element null or no element type or element.style is null")
      this.element = element
      this.style = element.style
      this.backupChanges = arguments.length>=2?backupChanges:true
      if(this.backupChanges){
         this.propertiesBackup = new Object()
         this.stylesBackup = new Object()
      }
   }
   
   ElementWrapper.prototype = {
      constructor: ElementWrapper,
      getElement: function(){
         return this.element 
      },
      /*
       * Returns a memento of the changes done through the element wrapper
       * This is necessary to enable passing this information from a dialog to its parent window
       * as in this case the information is cloned
       */
      getChangeMemento: function(){
         return {propertiesBackup: this.propertiesBackup, stylesBackup: this.stylesBackup}
      },
      setChangeMemento: function(changeMemento){
         if(!this.backupChanges){
            throw new Error("Object doesn't support restoring")
         }
         this.propertiesBackup = changeMemento.propertiesBackup
         this.stylesBackup = changeMemento.stylesBackup
      },
      backupStyle: function(prop){
         if(this.stylesBackup[prop]==null){
            this.stylesBackup[prop] = this.style.getPropertyValue[prop]
         }
      },
      backupProperty: function(prop){
         if(this.propertiesBackup[prop]==null){
            this.propertiesBackup[prop] = this.element[prop]
         }
      },
      restore: function(){
         this.restoreProperties()
         this.restoreStyle() 
      },
      restoreProperty: function(prop){
         if(!this.propertiesBackup[prop])
            return
         this.element[prop] = this.propertiesBackup[prop]
         delete this.propertiesBackup[prop]
      },
      restoreProperties: function(){
         for (var m in this.propertiesBackup){
            this.restoreProperty(m)
         }
      },
      restoreStyle: function(){
         for (var m in this.stylesBackup){
            this.restoreStyleProperty(m)
         } 
      },
      restoreStyleProperty: function(prop){
         this.style.removeProperty(prop)
         var stylesBackupVal = this.stylesBackup[prop]
         if(!StringUtils.isEmpty(stylesBackupVal)){
            this.style[prop] = stylesBackupVal
         }
         delete this.stylesBackup[prop]
      },
      setProperty: function(prop, value){
         if(this.backupChanges){
            this.backupProperty(prop)
         }
         this.element[prop] = value            
      },
      setStyle: function(prop, value, priority){
         if(this.backupChanges){         
            this.backupStyle(prop)
         }
         if(StringUtils.isEmpty(value)){
            this.style.removeProperty(prop)
         }else{
            this.style.setProperty(prop, value, priority?priority:"")
         }
      },
      setCss: function(cssText, overwriteExisiting){
         if(overwriteExisiting){
            if(this.backupChanges){
               for(var m in this.style){
                  this.backupStyle(m)
               }
            }
            this.style.cssText = cssText
            return
         }else{
             var cssObj = CssUtils.parseCssText(cssText)
             for(var m in cssObj){
               if(this.backupChanges){
                  this.backupStyle(m)
               }
               this.style.setProperty(m, cssObj[m], "")
             }
         }
      }
   }

   this.ElementWrapper = ElementWrapper;
}).apply(this)
}