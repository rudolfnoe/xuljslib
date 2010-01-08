with(this){
(function(){
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
this.FunctionShortcut = FunctionShortcut

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
    
}).apply(this)
}