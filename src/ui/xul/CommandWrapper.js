with(this){
(function(){
   function CommandWrapper(commandId, targetDoc){
      this.targetDoc = targetDoc?targetDoc:document
      this.command = this.targetDoc.getElementById(commandId) 
      if(!this.command)
         throw new Error("command with commandId " + commandId + " could not be found")
   }
   
   CommandWrapper.prototype = {
      constructor: CommandWrapper,
      
      doCommand: function(){
         if(this.command.hasAttribute('disabled') && this.command.getAttribute('disabled')=="true") 
            return
         this.command.doCommand()
      },
      
      handleKeydown: function(){
         this.doCommand()
      },

      handleKeypress: function(){
         this.doCommand()
      }
      
   }
   
   ObjectUtils.extend(CommandWrapper, AbstractGenericEventHandler, this)
   
   this["CommandWrapper"] = CommandWrapper
   
})()
}