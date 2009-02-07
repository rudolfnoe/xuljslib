with(this){
(function(){
   function ShortStringManager(targetObjects, executionDelay){
      this.AbstractShortcutManager(targetObjects, "keypress", true)
      this.executionDelay = executionDelay
      this.id = (new Date()).getTime() 
      this.keybuffer = ""
   }
   
   ShortStringManager.prototype = {
      constructor: ShortStringManager,
      
      addShortcut: function(shortString, commandDefinition, comandThisObj, clientId){
         this.abstractAddShortcut(this.assureSameCase(shortString), commandDefinition, comandThisObj, clientId)            
      },
      
      assureSameCase: function(shortString){
         return shortString.toLowerCase()
      },
      
      execute: function(){
         this.executeCommands(this.keybuffer)
         this.resetVariables()
      },
      
      handleEventInternal: function(event){
         var target = event.originalTarget
         if(DomUtils.isEditableElement(target) || this.hasModifier(event)){
            this.resetVariables()
            return
         }
         this.keybuffer += this.assureSameCase(String.fromCharCode(event.charCode))
         Utils.executeDelayed(this.id, this.executionDelay, this.execute, this)
      },
      
      resetVariables: function(){
         this.keybuffer = "",
         Utils.clearExecuteDelayedTimer(this.id)
      }
      
   }
   
   ObjectUtils.extend(ShortStringManager, "AbstractShortcutManager", this)

   this.ShortStringManager = ShortStringManager;
}).apply(this)
}