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
      
      createErrorMessage: function(err, message){
            var errorMessage = message?message+": ":"";
            errorMessage += err.message + "\n"
            if(err){
               for (m in err) {
                  errorMessage = errorMessage + m + ": " + err[m] + "\n";
               }
            }
            return errorMessage
      },

      init: function(){
         this.updateConfig()
         setInterval(Utils.bind(this.updateConfig, this), this.configUpdateInterval)
      },
      
      log: function(message, logLevel){
         if(this.currentLogLevel <= logLevel ){
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
      
      logError: function(err, message){
         this.log(this.createErrorMessage(err, message), LogLevel.ERROR)
      },

      logFatal: function(err, message){
         this.log(this.createErrorMessage(err, message), LogLevel.FATAL)
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