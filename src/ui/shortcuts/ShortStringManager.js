with(this){
(function(){
   function ShortStringManager(targetObjects, executionDelay, inputBlockingKeyComb){
      this.AbstractShortcutManager(targetObjects, "keypress", true)
      this.executionDelay = executionDelay
      this.isInputBlockingActive = false
      this.keybuffer = ""
      this.mainTimerId = (new Date()).getTime() 
      if(inputBlockingKeyComb){
         this.releaseInputBlockingTimerId = this.mainTimerId + "_releaseInputBlocking"
         this.shortcutManager = new ShortcutManager(targetObjects, "keydown", false, true)
         this.shortcutManager.addShortcut(inputBlockingKeyComb, this.toogleInputBlocking, this)
      }
   }
   
   ShortStringManager.prototype = {
      constructor: ShortStringManager,
      
      activateInputBlocking: function(){
         this.isInputBlockingActive = true
         this.setTimerForReleaseInputBlocking()
      },
      
      addShortcut: function(shortString, commandDefinition, comandThisObj, clientId){
         this.abstractAddShortcut(this.assureSameCase(shortString), commandDefinition, comandThisObj, clientId)            
      },
      
      assureSameCase: function(shortString){
         return shortString.toLowerCase()
      },
      
      deactivateInputBlocking: function(){
         this.releaseInputBlocking()
         Utils.clearExecuteDelayedTimer(this.releaseInputBlockingTimerId)
      },
      
      destroy: function(){
         Utils.clearExecuteDelayedTimer(this.mainTimerId)
         if(this.shortcutManager){
            this.shortcutManager.destroy()
         }
         this.abstractDestroy()
      },

      execute: function(){
         this.executeCommands(this.keybuffer)
         this.resetVariables()
      },
      
      /*
       * Main key event handler
       */
      handleEventInternal: function(event){
         var target = event.originalTarget
         if((!this.isInputBlockingActive && DomUtils.isEditableElement(target)) || event.charCode==0 || this.hasModifier(event)){
            this.resetVariables()
            return
         }
         this.keybuffer += this.assureSameCase(String.fromCharCode(event.charCode))
         if(this.isKeybufferUnique(this.keybuffer)){
            this.execute()
         }else{
            Utils.executeDelayed(this.mainTimerId, this.executionDelay, this.execute, this)
         }
         //Block input, must be done at the end as stopEvent clears the event obj!!!
         if(this.isInputBlockingActive){
            Utils.stopEvent(event)
            this.setTimerForReleaseInputBlocking()
         }
      },
      
      isKeybufferUnique: function(keybuffer){
         var commandArray = this.getCommandArray(keybuffer)
         //If keybuffer does not match exactly return
         if(!commandArray){
            return false
         }
         var shortString2CommandMap = this.getCommandMap()
         for(var m in shortString2CommandMap){
            if(StringUtils.startsWith(m, keybuffer) && m!=keybuffer){
               return false
            }
         }
         return true
      },
      
      releaseInputBlocking: function(){
         this.isInputBlockingActive = false
      },
      
      resetVariables: function(){
         this.keybuffer = "",
         Utils.clearExecuteDelayedTimer(this.mainTimerId)
      },
      
      setTimerForReleaseInputBlocking: function(){
         Utils.executeDelayed(this.releaseInputBlockingTimerId, this.executionDelay, this.releaseInputBlocking, this)      
      },
      
      toogleInputBlocking: function(){
         if(this.isInputBlockingActive){
            this.deactivateInputBlocking()
         }else{
            this.activateInputBlocking()
         }
      }
   }
   
   ObjectUtils.extend(ShortStringManager, "AbstractShortcutManager", this)

   this.ShortStringManager = ShortStringManager;
}).apply(this)
}