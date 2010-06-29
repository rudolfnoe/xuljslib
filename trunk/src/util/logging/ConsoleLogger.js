with(this){
(function(){
   const CONSOLE_SERVICE = Components.classes["@mozilla.org/consoleservice;1"]
                  .getService(Components.interfaces.nsIConsoleService);
   
   function ConsoleLogger(prefKeyLogLevel, configUpdateInterval){
      Assert.paramsNotNull(arguments)
      Assert.isFalse(isNaN(parseInt(configUpdateInterval)), "Config update interval must be a number")
      this.configUpdateInterval = configUpdateInterval
      this.currentLogLevel = LogLevel.ERROR
      this.prefKeyLogLevel = prefKeyLogLevel
      
      this.init()
   }
   
   ConsoleLogger.prototype = {
      constructor: ConsoleLogger,
      
      getLogLevel: function(){
         return this.currentLogLevel
      },

      setLogLevel: function(currentLogLevel){
         this.currentLogLevel = currentLogLevel
      },
      
      /*
       * @param Error err
       * @param String message
       * @param Boolean printStackTrace: Boolean indicating whether the stacktrace should be included
       */
      createErrorMessage: function(err, message, printStackTrace){
            var printStackTrace = printStackTrace!=null?printStackTrace:true
            var errorMessage = message?message+": ":"";
            errorMessage += err.message + "\n"
            if(err){
               for (m in err) {
                  if(!printStackTrace && m=="stack"){
                     continue
                  }
                  errorMessage = errorMessage + m + ": " + err[m] + "\n";
               }
            }
            return errorMessage
      },

      init: function(){
         this.updateConfig()
         setInterval(Utils.bind(this.updateConfig, this), this.configUpdateInterval)
      },
      
      isDebug: function(){
         return this.isLogLevel(LogLevel.DEBUG)
      },
      
      isLogLevel: function(logLevel){
         return this.currentLogLevel <= logLevel   
      },
      
      log: function(message, logLevel){
         if(this.isLogLevel(logLevel)){
            if(logLevel >= LogLevel.ERROR){
               Components.utils.reportError(message)
            }else{
               CONSOLE_SERVICE.logStringMessage(message)
            }
         }
      },
      
      logDebug: function(message){
         this.log(message, LogLevel.DEBUG)
      },
      
      logError: function(err, message, printStackTrace){
         this.log(this.createErrorMessage(err, message, printStackTrace), LogLevel.ERROR)
      },

      logFatal: function(err, message, printStackTrace){
         this.log(this.createErrorMessage(err, message, printStackTrace), LogLevel.FATAL)
      },

      logInfo: function(message){
         this.log(message, LogLevel.INFO)
      },
      
      logWarning: function(message){
         this.log(message, LogLevel.WARNING)
      },
      
      updateConfig: function(){
         this.currentLogLevel = Application.prefs.getValue(this.prefKeyLogLevel, LogLevel.ERROR)
      }
      
   }

   this.ConsoleLogger = ConsoleLogger;
}).apply(this)
}