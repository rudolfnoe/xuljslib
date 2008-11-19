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
 * @param eventType: type of event on which should be listened ("keydown", "keypress"
 * @param suppressKey: boolean indicating whether the the default behavior of key resulting in a shortcut should be suppressed
 */
//TODO different event types
function ShortcutManager(targetObjects, eventType, suppressShortcutKeys, useCapture){
   if(targetObjects.constructor.toString().indexOf("function Array")==-1)
      targetObjects = new Array(targetObjects)
   this.targetObjects = targetObjects
   this.eventType  = arguments.length>=2?eventType:"keydown"
   this.suppressShortcutKeys = arguments.length>=3?suppressShortcutKeys:true
   this.useCapture = arguments.length>=4?useCapture:true
   this.shortcuts = new Object();
   this.currentEvent = null;
   this.elementsWithShortcuts = new Array()
   this.windowKeyEventHandler = new KeyEventHandler(this, "handleWindowEvent")
   this.elementKeyEventHandler = new KeyEventHandler(this, "handleElementEvent")
   for (var i = 0; i < this.targetObjects.length; i++) {
      this.addEventListenerToTarget(this.targetObjects[i]);
   }
}

ShortcutManager.prototype = {
   //Main event listening method
   handleWindowEvent : function(event) {
      this.handleEvent(event)
   },
   
   handleElementEvent: function(event){
      var srcElement = event.currentTarget;
      if(srcElement.id)
         this.handleEvent(event, srcElement.id)
      else 
         this.handleEvent(event, srcElement.name);
   },
   
   handleEvent: function(event, elementId){
      var shortcutKey = this.encodeEvent(event, elementId);
      if (elementId)
         shortcutKey = elementId + "_" + shortcutKey;
      var shortcutArray = this.shortcuts[shortcutKey]
      if (shortcutArray) {
         this.currentEvent = event;
         for (var i = 0; i < shortcutArray.length; i++) {
            var result = shortcutArray[i].handleEvent(event);
            if(this.suppressShortcutKeys || result&ShortcutManager.SUPPRESS_KEY){
               event.preventDefault();
               event.stopPropagation();
            }
            if (result & ShortcutManager.PREVENT_FURTHER_EVENTS) {
               break;
            }
         }
      } else {
         this.currentEvent = null;
      }
   },
   
   addEventListenerToTarget: function(targetObj){
      targetObj.addEventListener(this.eventType, this.windowKeyEventHandler, this.useCapture);
   },
   
   /*
    * Adds JS shortcut
    * @param combinedKeyCode: combinedKeyCode = keyCode << 4 | Event.ALT_MASK | Event.CONTROL_MASK | Event.SHIFT_MASK | Event.META_MASK 
    *    @see createCominedKeyCode
    * @param shortcutTarget: Could be string with java script code, shortcut object implementing the handleEvent method, a function or 
    *    an eventhanlder object implementing the handleEvent-method
    * @param cliendId: id with which the shortcut can be removed 
    */
   _addShortcut: function(keyCombination, shortcutTarget, targetObj, elementId, clientId){
      if(this.destroyed)
         throw new Error('Shortcutmananger already destroyed')
   	var shortcutKey = null
   	if(!isNaN(keyCombination)){
   		shortcutKey = keyCombination
//   	}else if(COMBINED_KEY_CODE_REG_EXP.test(keyCombination)){
//   		shortcutKey = keyCombination
   	}else if(typeof keyCombination=="string"){
   		shortcutKey = this.parseKeyCombination(keyCombination)
   	}else{
   		throw new Error('Wrong key combinatin provided')
   	}
      if(elementId){
         shortcutKey = elementId + "_" + shortcutKey
      }
   	var shortcut = null
   	if(shortcutTarget.constructor == String){//instanceof doesn't work
   		shortcut = new JsShortcut(shortcutTarget, clientId)
   	}else if(typeof shortcutTarget == "function" || 
   	     (shortcutTarget!=null && typeof shortcutTarget.handleEvent == "function")){
   	  shortcut = new FunctionShortcut(shortcutTarget, targetObj, clientId)     	
   	}else if(shortcutTarget instanceof XULElement && shortcutTarget.tagName.toLowerCase()=="command"){
         shortcut = new CommandShortcut(shortcutTarget, clientId)   
      }else{
   	  throw new Error('shortcutTarget is neither String nor Function or EventHandler')	
   	}
   	
      var shortcutArray = this.shortcuts[shortcutKey];
      if(shortcutArray==null)
         this.shortcuts[shortcutKey] = new Array(shortcut);
      else
         shortcutArray.push(shortcut);
   },
   
   addShortcut: function(keyCombination, shortcutTarget, targetObj, clientId){
      this._addShortcut(keyCombination, shortcutTarget, targetObj, null, clientId)
   },
   
   addShortcutForElement: function(elementOrId, keyCombination, shortcutTarget, targetObj, clientId){
      var element = null
      var elementId = null
      if(typeof elementOrId == "string"){
         elementId = elementOrId
         element = document.getElementById(elementOrId);
      }else{
         element = elementOrId
         elementId = element.getAttribute('id') 
      }
      if(!element)
         throw new Error("Element for elementId does not exist");
      if(elementId==null || elementId.length==0)
         throw new Error('Element must have id')
      this.elementsWithShortcuts.push(element)
      this._addShortcut(keyCombination, shortcutTarget, targetObj, elementId, clientId)
      element.addEventListener("keydown", this.elementKeyEventHandler, this.useCapture);
   },

   
   //Only for backward compatibility
   addJsShortcut: function(keyCode, modifierMask, jsCode, clientId){
       if(modifierMask==null){
           modifierMask = 0;
       }
       var combinedKeyCode = this.createShortcutKey(keyCode, modifierMask)       
       this.addShortcut(combinedKeyCode, jsCode, null, null, clientId)
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
       this.addShortcut(combinedKeyCode, jsCode, null, null, clientId);
   },
   
   addJsShortcutForElement: function(elementId, keyCode, modifierMask, jsCode, clientId){
      var shortcutKey = this.createShortcutKey(keyCode, modifierMask)
      this.addShortcutForElement(elementId, shortcutKey, jsCode, null, clientId)
   },
   
   addTargetObject: function(obj){
      this.targetObjects.push(obj)
      this.addEventListenerToTarget(obj)
   },
   
   /*
    * Löscht alle Shortcuts mit einer bestimmten
    * ClientId
    */
   clearAllShortcuts: function(clientId){
   	if(clientId==null){
   		this.shortcuts = new Object()
   		return
   	}
      try{
         for(i in this.shortcuts){
            var shortcutArray = this.shortcuts[i];
            var newShortcutArray = new Array();
            for(var j = 0; j < shortcutArray.length; j++){
               var shortcut = shortcutArray[j];
               if(shortcut.clientId!=clientId)
                  newShortcutArray[newShortcutArray.length] = shortcut;
            }
            this.shortcuts[i] = newShortcutArray;
         }
      }catch(e){alert(e)}
   },
   
   createCombinedKeyCode: function(keyCode, modifierMask){
      return keyCode << 4 | modifierMask
   },

   createShortcutKey: function(keyCode, modifierMask, elementId){
      var shortcutKey = this.createCombinedKeyCode(keyCode, modifierMask)
      if(elementId)
         shortcutKey = elementId + "_" + shortcutKey;
      return shortcutKey;
   },
   
   /*
    * Encodes KeyEvent
    */
   encodeEvent: function(event){
       return event.keyCode << 4 | this.encodeEventModifier(event);
   },
   
   encodeEventModifier: function(event){
       return event.altKey * Event.ALT_MASK |
           event.ctrlKey * Event.CONTROL_MASK |
           event.shiftKey * Event.SHIFT_MASK |
           event.metaKey * Event.META_MASK;
   },
   
   destroy: function(){
      for (var i = 0; i < this.targetObjects.length; i++) {
         this.targetObjects[i].removeEventListener(this.eventType, this.windowKeyEventHandler, this.useCapture);
      }
      for (var i = 0; i < this.elementsWithShortcuts.length; i++) {
         this.elementsWithShortcuts[i].removeEventListener(this.eventType, this.elementKeyEventHandler, this.useCapture);
      }
      this.shortcuts = null
      this.destroyed = true
   },
   
   isModifierCombination: function(event, modifierCombination){
       return this.encodeEventModifier(event)==modifierCombination
   },
   
   parseKeyCombination: function(keyCombination){
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
      return this.createCombinedKeyCode(keyCode, modifierMask)
   }
}

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

/*
 * Superclass of all Shortcut objects
 */
function AbstractShortcut(){
	
}
AbstractShortcut.prototype = {
   AbstractShortcut: function(clientId){
	  this.clientId = clientId
   
   }
}

//Shortcut for JS code
function JsShortcut(jsCode, clientId){
    this.AbstractShortcut(clientId)
    this.jsCode = jsCode.replace(/'/g, '"');
}

JsShortcut.prototype = new AbstractShortcut()
JsShortcut.prototype.handleEvent = function(event){
       return window.eval(this.jsCode);
}
this["JsShortcut"] = JsShortcut;

//Shortcut for function pointer or event handler
function FunctionShortcut(eventHandler, targetObj, clientId){
   if(!(typeof eventHandler == "function") &&
      !(typeof eventHandler.handleEvent == "function")){
      throw new Error("FunctionShortcut.constructor: eventhandler must be function or must implement eventhandler interface")    
   }
   this.AbstractShortcut(clientId)
   this.eventHandler = eventHandler
   this.targetObj = targetObj
}

FunctionShortcut.prototype = AbstractShortcut.prototype

FunctionShortcut.prototype.handleEvent = function(event){
   if(typeof this.eventHandler == "function"){
      if(this.targetObj==null)
         return this.eventHandler(event)
      else
         return this.eventHandler.apply(this.targetObj, [event])
   }else{
      return this.eventHandler.handleEvent(event)
   }
}

function CommandShortcut(commandElement,  clientId){
   this.AbstractShortcut(clientId)
   this.commandElement = commandElement
   if(this.commandElement==null)
      throw new Error('command with commandid does not exist')
   
}

CommandShortcut.prototype = new AbstractShortcut()

CommandShortcut.prototype.handleEvent = function(event){
   if(this.commandElement.getAttribute('disabled')=="false")
      this.commandElement.doCommand()
}
this["CommandShortcut"] = CommandShortcut;


//Constants
ShortcutManager.ALT = Event.ALT_MASK;
ShortcutManager.CTRL = Event.CONTROL_MASK;
ShortcutManager.SHIFT = Event.SHIFT_MASK;
ShortcutManager.CTRL_SHIFT = Event.CONTROL_MASK | Event.SHIFT_MASK;
ShortcutManager.ALT_SHIFT = Event.ALT_MASK | Event.SHIFT_MASK;
ShortcutManager.CTRL_ALT = Event.ALT_MASK | Event.CONTROL_MASK;
ShortcutManager.SUPPRESS_KEY = 1;
ShortcutManager.PREVENT_FURTHER_EVENTS = 2

this["ShortcutManager"] = ShortcutManager;
}).apply(this)
}