with(this){
(function(){
   var KeyEventUtils = {
      hasAltCtrlMetaModifier: function(event){
         Assert.paramsNotNull(arguments)
         return event.altKey || event.ctrlKey || event.metaKey
      }
   }

   this.KeyEventUtils = KeyEventUtils;
}).apply(this)
}