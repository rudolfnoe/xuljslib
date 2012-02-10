with(this){
(function(){
   function Message(text, severity){
      this.text = text
      this.severity = severity?severity:Severity.ERROR
   }
   
   //Static
   Message.createFromError = function(errorObj){
      var severity = errorObj.severity?errorObj.severity:Severity.ERROR
      return new Message(errorObj.message, severity)
   }
   
   Message.prototype = {
      constructor: Message,

      getSeverity: function(){
         return this.severity
      },

      setSeverity: function(severity){
         this.severity = severity
      },

      getText: function(){
         return this.text
      },

      setText: function(text){
         this.text = text
      },
      
      isError: function(){
         return this.severity==Severity.ERROR
      },

      isInfo: function(){
         return this.severity==Severity.INFO
      },

      isWarning: function(){
         return this.severity==Severity.WARNING
      }
   }

   this.Message = Message;
}).apply(this)
}