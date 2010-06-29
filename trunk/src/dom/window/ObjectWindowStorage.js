with(this){
(function(){
   /*
    * Lets you transparently store objects per content windows
    */
   var ObjectWindowStorage = {
      /*
       * Retrieves an object on a content win
       * @param DOMWindow
       * @param String ns
       * @param String key
       */
      getObject: function(win, ns, key){
         Assert.paramsNotNull(arguments)
         Assert.notNull(win[ns], "Namespace object is null")
         return win[ns][key]
      },
      
      hasObject: function(win, ns, key){
         Assert.paramsNotNull(arguments)
         if(!win[ns]){
            return false
         }
         return win[ns][key]!=null
      },

      /*
       * Store an object on a content win
       * @param DOMWindow
       * @param String ns
       * @param String key
       * @param Obejct value
       */
      setObject: function(win, ns, key, value){
         Assert.paramsNotNull(arguments)
         if(!win[ns]){
            win[ns] = {}
         }
         win[ns][key] = value
      }
      
   }

   this.ObjectWindowStorage = ObjectWindowStorage;
}).apply(this)
}