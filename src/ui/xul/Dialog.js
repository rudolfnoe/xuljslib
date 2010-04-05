with(this){
(function(){
   //Dialog Modes
   DialogMode={
      MODAL:"MODAL",
      NON_MODAL:"NON_MONDAL"
   }
   this.DialogMode = DialogMode
   
   //Dialog results
   DialogResult={
      OK:"OK",
      CANCEL:"CANCEL"
   }
   this.DialogResult = DialogResult

   //Constructor
   function Dialog(url, name, modal, parentWin, features, argObj){
      this.url = url
      this.name = name
      this.modal = modal
      this.parentWin = parentWin
      this.features = features
      this.argObj = argObj
      this.listeners = new ArrayList()
      this.dialog = null
   }
   
   //Member methods
   Dialog.prototype = {
      constructor: Dialog,
      Dialog: Dialog,

      addEventListener: function(listener){
        this.listeners.add(listener)         
      },
      
      getNamedResult: function(key){
         //As dialog is closed objects must be cloned so they get the new context of the calling window
         return ObjectUtils.deepClone(this.dialogContext.resultObj[key])
      },
      
      getResult: function(){
         return this.dialogContext.result 
      },
      
      informListeners: function(){
         for (var i = 0; i < this.listeners.size(); i++) {
            if(this.dialogContext.result==DialogResult.OK && this.listeners.get(i).handleDialogAccept)
               this.listeners.get(i).handleDialogAccept(this.dialogContext.resultObj)
            else if(this.dialogContext.result==DialogResult.CANCEL && this.listeners.get(i).handleDialogCancel)
               this.listeners.get(i).handleDialogCancel(this.dialogContext.resultObj)
         }
      },
      
      isCancel: function(){
         return this.getResult()==DialogResult.CANCEL  
      },

      isOk: function(){
         return this.getResult()==DialogResult.OK  
      },
      
      setFeatures: function(features){
         this.features = features
      },
      
      show: function(point){
         this.dialogContext = new DialogContext(this.argObj)
         var features = this.features?this.features:""
         features += this.modal?", modal=yes":""
         if(point==null)
            features += ", centerscreen=yes"
         else{
            features += ", left=" + point.getX() + "px "
            features += ", top=" + point.getY() + "px "
         }
         this.dialog = this.parentWin.openDialog(this.url, this.name, features, this.dialogContext)
         if(this.modal){
            this.informListeners();
         }else{
            this.dialog.addEventListener("unload", Utils.bind(this.informListeners, this), true)
         }
      }
   }
   
   //Static methods
   Dialog.addOkListener = function(eventHandler, capture){
      this.getDialog().addEventListener("dialogaccept", eventHandler, capture)
   }
   
   Dialog.acceptDialog = function(){
      Dialog.getDialog().acceptDialog()
   }
   
   Dialog.clearMessageInHeader = function(){
      Dialog.setMessageInHeader("")   
   },
   
   Dialog.getAcceptButton = function(){
      return document.getAnonymousElementByAttribute(document.documentElement, "dlgtype", "accept")
   }
   
   Dialog.getDialog = function(){
      var dialogs = document.getElementsByTagName('dialog')
      if(dialogs.length!=1)
         throw new Error('No or to much dialog elements')
      return dialogs[0]
   }
   
   Dialog.getNamedArgument = function(key, clone){
      clone = clone?clone : false
      if(!window.arguments || !window.arguments[0] || !window.arguments[0].argObj)
         throw new Error('No argument set')
      var result = window.arguments[0].argObj[key] 
      if(clone)
         result = ObjectUtils.deepClone(result)
      return result
   }
   
   Dialog.setErrorMessageInHeader = function(messageText){
      Dialog.setMessageInHeader(messageText, Severity.ERROR) 
   },

   Dialog.setMessageInHeader = function(messageText, severity){
      severity = severity?severity:Severity.INFO 
      var dialogHeader = DomUtils.getFirstDescendantByTagName(null, 'dialogheader')
      if(dialogHeader==null)
         throw new Error ('No dialogheader in dialog')
      dialogHeader.setMessage(messageText, severity)
   }
   
   Dialog.addOkValidator = function(validator){
      Assert.isTrue(ObjectUtils.instanceOf(validator, AbstractValidator), "validator must implement AbstractValidator")
      validator.addValidStateChangedListener({handleEvent: function(event){
         Dialog.getAcceptButton().disabled = !event.isValid
      }})
   }
   
   Dialog.setResultOjb = function(obj){
      window.arguments[0].resultObj = obj
   }
   
   Dialog.setNamedResult = function(key, value){
      window.arguments[0].resultObj[key]=value
   }
   
   Dialog.setResult = function(result){
      window.arguments[0].result = result
   }
   
   function DialogContext(argObj){
      this.argObj = argObj
      this.resultObj = new Object()
      this.result = DialogResult.CANCEL
   }
   
   this.Dialog = Dialog;
   
}).apply(this)
}