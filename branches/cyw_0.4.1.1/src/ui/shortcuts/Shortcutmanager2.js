with(this){
/*
 * ShortcutManager
 * Created by Rudolf Noé
 * 18.06.2005
 */

(function(){
	
const COMBINED_KEY_CODE_REG_EXP = /^[kc]{1}\d*$/

/*
 * Constructor
 * @param targetObject: object on which the key event listener will be installed or array of objects
 * @param eventType: type of event on which should be listened ("keydown", "keypress"); optional, Default = "keydown"
 * @param suppressKey: boolean indicating whether the the default behavior of key resulting in a shortcut should be suppressed; Default = true
 * @param useCapture: Default = true
 */
//TODO different event types
function ShortcutManager(targetObjects, eventType, suppressShortcutKeys, useCapture){
   this.AbstractShortcutManager(targetObjects, eventType, useCapture)
   this.suppressShortcutKeys = arguments.length>=3?suppressShortcutKeys:true
   this.elementsWithShortcuts = new Array()
   this.elementKeyEventHandler = new KeyEventHandler(this, "handleElementEvent")
}

ShortcutManager.prototype = {
   handleElementEvent: function(event){
      if(this.isSuspended())
         return
      var srcElement = event.currentTarget;
      this.handleEventInternal(event, srcElement.de_mouseless_shortcutmanager_id);
   },

   //main event handling method
   handleEventInternal: function(event, elementId){
      var shortcutKey = this.encodeEvent(event, elementId);
      if (elementId)
         shortcutKey = elementId + "_" + shortcutKey;
      var result = this.executeCommands(shortcutKey, event)
   },
   
   addShortcut: function(keyCombination, cmdDefinition, cmdThisObj, clientId){
      this.abstractAddShortcut(ShortcutManager.getShortcutKey(keyCombination), cmdDefinition, cmdThisObj, clientId)
   },
   
   addShortcutForElement: function(elementOrId, keyCombination, cmdDefinition, cmdThisObj, clientId){
      var element = null
      var elementId = null
      if(typeof elementOrId == "string"){
         elementId = elementOrId
         element = document.getElementById(elementOrId);
      }else{
         element = elementOrId
         elementId = element.getAttribute('id')
         if(StringUtils.isEmpty(elementId)){
            elementId = (new Date()).toString()
         }
      }
      if(!element)
         throw new Error("Element for elementId does not exist");
      element.de_mouseless_shortcutmanager_id = elementId
      if(!ArrayUtils.contains(this.elementsWithShortcuts, element)){
         this.elementsWithShortcuts.push(element)
         element.addEventListener(this.getEventType(), this.elementKeyEventHandler, this.useCapture);
      }
      this.abstractAddShortcut(ShortcutManager.getShortcutKey(keyCombination, elementId), cmdDefinition, cmdThisObj, clientId)
   },

   
   //Only for backward compatibility
   addJsShortcut: function(keyCode, modifierMask, jsCode, clientId){
       if(modifierMask==null){
           modifierMask = 0;
       }
       var combinedKeyCode = this.createShortcutKey(keyCode, modifierMask)       
       this.addShortcut(ShortcutManager.getShortcutKey(combinedKeyCode), jsCode, null, clientId)
   },
   
   /*
    * Adds JS shortcut
    * @param combinedKeyCode: combinedKeyCode = keyCode << 4 | Event.ALT_MASK | Event.CONTROL_MASK | Event.SHIFT_MASK | Event.META_MASK 
    *    @see createCominedKeyCode
    * @param jsCode: String containing JS
    * @param cliendId: id with which the shortcut can be removed
    * Only for backward compatibility 
    */
   addJsShortcutWithCombinedKeyCode: function(combinedKeyCode, jsCode, clientId){
       this.addShortcut(ShortcutManager.getShortcutKey(combinedKeyCode), jsCode, null, clientId);
   },
   
   addJsShortcutForElement: function(elementId, keyCode, modifierMask, jsCode, clientId){
      var shortcutKey = this.createShortcutKey(keyCode, modifierMask)
      this.addShortcutForElement(elementId, shortcutKey, jsCode, null, clientId)
   },
   
   clearAllShortcuts: function(clientId){
      //Call to superclass method
      this.AbstractShortcutManager_clearAllShortcuts(clientId)   
      this.removeElementEventListener()
   }, 
   
   createShortcutKey: function(keyCode, modifierMask, elementId){
      var shortcutKey = ShortcutManager.createCombinedKeyCode(keyCode, modifierMask)
      if(elementId)
         shortcutKey = elementId + "_" + shortcutKey;
      return shortcutKey;
   },

   destroy: function(){
      this.abstractDestroy()
      this.removeElementEventListener()
   },
   
   /*
    * Encodes KeyEvent
    */
   encodeEvent: function(event){
      return ShortcutManager.encodeEvent(event);
   },
   
   isStopEvent: function(commandResult){
      return ( ( this.suppressShortcutKeys && (commandResult&ShortcutManager.DO_NOT_SUPPRESS_KEY)==0 ) || 
               (commandResult&ShortcutManager.SUPPRESS_KEY) != 0)
   },
   
   isPreventFurtherCommands: function(commandResult){
      return commandResult & ShortcutManager.PREVENT_FURTHER_EVENTS
   },

   removeElementEventListener: function(){
      for (var i = 0; i < this.elementsWithShortcuts.length; i++) {
         this.elementsWithShortcuts[i].removeEventListener(this.eventType, this.elementKeyEventHandler, this.useCapture);
      }
      this.elementsWithShortcuts = []
   }
}

ObjectUtils.extend(ShortcutManager, "AbstractShortcutManager", this)

//"Static" methods
ShortcutManager.createCombinedKeyCode = function(keyCode, modifierMask){
   return keyCode << 4 | modifierMask
}

ShortcutManager.encodeEvent =  function(event){
   var keyCode = null
   if(this.eventType=="keydown" || event.charCode==0){
      keyCode = event.keyCode
   }else{
      keyCode = event.charCode
   }
   return keyCode << 4 | ShortcutManager.encodeEventModifier(event);
}

ShortcutManager.encodeEventModifier =  function(event){
    return event.altKey * Event.ALT_MASK |
        event.ctrlKey * Event.CONTROL_MASK |
        event.shiftKey * Event.SHIFT_MASK |
        event.metaKey * Event.META_MASK;
}

ShortcutManager.getShortcutKey = function(keyCombination, elementId){
   var shortcutKey = null
   if(!isNaN(keyCombination)){
      shortcutKey = keyCombination
//    }else if(COMBINED_KEY_CODE_REG_EXP.test(keyCombination)){
//       shortcutKey = keyCombination
   }else if(typeof keyCombination=="string"){
      shortcutKey = this.parseKeyCombination(keyCombination)
   }else{
      throw new Error('Wrong key combinatin provided')
   }
   if(elementId){
      shortcutKey = elementId + "_" + shortcutKey
   }
   return shortcutKey
}

ShortcutManager.isModifierCombination = function(event, modifierCombination){
   return ShortcutManager.encodeEventModifier(event)==modifierCombination
}

ShortcutManager.parseKeyCombination = function(keyCombination){
   var parts = keyCombination.split("+")
   var keyPart = StringUtils.trim(parts.pop()).toUpperCase()
   var keyCode = KeyEvent["DOM_VK_"+keyPart]
   var modifierMask = 0
   for (var i = 0; i < parts.length; i++) {
      var modifier = StringUtils.trim(parts[i]).toUpperCase()
      switch(modifier){
         case "CTRL":
            modifierMask = modifierMask | ShortcutManager.CTRL
            break;
         case "SHIFT": 
            modifierMask = modifierMask | ShortcutManager.SHIFT
            break;
         case "ALT": 
            modifierMask = modifierMask | ShortcutManager.ALT
            break;
      }
   }
   return ShortcutManager.createCombinedKeyCode(keyCode, modifierMask)
}

//Constants
ShortcutManager.ALT = Event.ALT_MASK;
ShortcutManager.CTRL = Event.CONTROL_MASK;
ShortcutManager.SHIFT = Event.SHIFT_MASK;
ShortcutManager.CTRL_SHIFT = Event.CONTROL_MASK | Event.SHIFT_MASK;
ShortcutManager.ALT_SHIFT = Event.ALT_MASK | Event.SHIFT_MASK;
ShortcutManager.CTRL_ALT = Event.ALT_MASK | Event.CONTROL_MASK;
ShortcutManager.SUPPRESS_KEY = 1;
ShortcutManager.PREVENT_FURTHER_EVENTS = 2
ShortcutManager.DO_NOT_SUPPRESS_KEY = 4;


this["ShortcutManager"] = ShortcutManager;

}).apply(this)
}