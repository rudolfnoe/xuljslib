with(this){
(function(){
   /*
    * @param targetObjects: Object or array of objects on which key listener will be attachted
    * @param: eventType: type of event to which the shortcut manager will listen ("keydown", "keypress") Default=keydown
    * @param: useCapture: Default = true 
    */
   function AbstractShortcutManager(targetObjects, eventType, useCapture){
      this.destroyed = false
      this.currentEvent = null
      this.eventType  = eventType!=null?eventType:"keydown"
      this.keyEventHandler = new KeyEventHandler(this, "handleEvent")
      //shortcut to command map
      //key shortcutkey; value command 
      this.shortcutToCommandMap = {}
      this.suspended = false
      if(targetObjects.constructor && targetObjects.constructor.toString().indexOf("function Array")!=-1){
         this.targetObjects = targetObjects
      }else{
         this.targetObjects = new Array(targetObjects)
      }
      this.useCapture = arguments.length>=3?useCapture:true
      
      for (var i = 0; i < this.targetObjects.length; i++) {
         this.addEventListenerToTarget(this.targetObjects[i]);
      }
   }
   
   AbstractShortcutManager.prototype = {
      constructor: AbstractShortcutManager,
      AbstractShortcutManager: AbstractShortcutManager,

      getShortcuts: function(){
         return this.shortcutToCommandMap
      },
      
      getCommandMap: function(){
         return this.shortcutToCommandMap
      },  

      getCurrentEvent: function(){
         return this.currentEvent 
      },
      
      getEventType: function(){
         return this.eventType
      },

      setEventType: function(eventType){
         this.eventType = eventType
      },
   
      /*
       * 
       */
      abstractAddShortcut: function(shortcutKey, cmdDefinition, cmdThisObj, clientId){
         if(this.destroyed)
            throw new Error('Shortcutmananger already destroyed')
   
         var command = null
         if(cmdDefinition.constructor == String){//instanceof doesn't work
            command = new JsShortcut(cmdDefinition, clientId)
         }else if(typeof cmdDefinition == "function" || 
              (cmdDefinition!=null && typeof cmdDefinition.handleEvent == "function")){
           command = new FunctionShortcut(cmdDefinition, cmdThisObj, clientId)        
         }else if(cmdDefinition instanceof XULElement && cmdDefinition.tagName.toLowerCase()=="command"){
            command = new CommandShortcut(cmdDefinition, clientId)   
         }else{
           throw new Error('cmdDefinition is neither String nor Function or EventHandler')  
         }
         
         var commandArray = this.shortcutToCommandMap[shortcutKey];
         if(commandArray==null)
            this.shortcutToCommandMap[shortcutKey] = new Array(command);
         else
            commandArray.push(command);
      },
      
      abstractDestroy: function(){
         for (var i = 0; i < this.targetObjects.length; i++) {
            this.targetObjects[i].removeEventListener(this.eventType, this.keyEventHandler, this.useCapture);
         }
         this.shortcutToCommandMap = null
         this.destroyed = true
      },
      
      addEventListenerToTarget: function(targetObj){
         targetObj.addEventListener(this.eventType, this.keyEventHandler, this.useCapture);
      },

      addTargetObject: function(obj){
         this.targetObjects.push(obj)
         this.addEventListenerToTarget(obj)
      },
      
      /*
       * Loescht alle Shortcuts mit einer bestimmten
       * ClientId
       */
      clearAllShortcuts: function(clientId){
         if(clientId==null){
            this.shortcutToCommandMap = new Object()
            return
         }
         try{
            for(i in this.shortcutToCommandMap){
               var shortcutArray = this.shortcutToCommandMap[i];
               var newShortcutArray = new Array();
               for(var j = 0; j < shortcutArray.length; j++){
                  var shortcut = shortcutArray[j];
                  if(shortcut.clientId!=clientId)
                     newShortcutArray[newShortcutArray.length] = shortcut;
               }
               this.shortcutToCommandMap[i] = newShortcutArray;
            }
         }catch(e){alert(e)}
      },
      
      destroy: function(){
         this.abstractDestroy()
      },
      
      executeCommands: function(shortcutKey, event){
         var commandArray = this.getCommandArray(shortcutKey)
         if(!commandArray){
            this.currentEvent = null
            return false
         }
         this.currentEvent = event
         for (var i = 0; i < commandArray.length; i++) {
            try{
               var result = commandArray[i].handleEvent(event);
            }catch(e){
               Utils.logError(e)
            }
            if(this.isStopEvent(result)){
               event.preventDefault();
               event.stopPropagation();
            }
            if(this.isPreventFurtherCommands(result)) {
               break;
            }
         }
      },
      
      getCommandArray: function(shortcutKey){
         return this.shortcutToCommandMap[shortcutKey]
      },
      
      getShortcutKey: function(keyCombination, elementId){
         throw new Error ('must be implemented')
      },
      
      getShortcutKeyFromEvent: function(event, addParam){
         throw new Error ('must be implemented')
      },

      handleEvent: function(event){
         if(this.suspended)
            return
         this.handleEventInternal(event)
      },
      
      handleEventInternal: function(event, addParam){
         throw new Error ('must be implemented')
      },
      
      hasModifier: function(event){
         return event.altKey || event.ctrlKey || event.metaKey   
      },
   
      isPreventFurtherCommands: function(commandResult){
         return false
      },
      
      isStopEvent: function(commandResult){
         return false
      },
      
      isSuspended: function(){
         return this.suspended
      },
      
      resume: function(){
         this.suspended = false
      },
      
      suspend: function(){
         this.suspended = true
      }
   }

   this.AbstractShortcutManager = AbstractShortcutManager;
   
   /*
    * Constructor for KeyEventHandler
    */
   function KeyEventHandler(shortcutManager, scmHandleEventFunction){
      this.shortcutManager = shortcutManager
      this.scmHandleEventFunction = scmHandleEventFunction
      this.handleEvent = function(event){
         this.shortcutManager[this.scmHandleEventFunction](event)
      }
   }
   this.KeyEventHandler = KeyEventHandler;
  
}).apply(this)
}