with(this){
(function(){
   /*
    * Represents the FF Statusbar
    */
   var Statusbar = {
      getStatusbar: function(){
         return window.top.document.getElementById('statusbar-display')
      },
      
      setText: function(text){
         this.getStatusbar().setAttribute('label', text)   
      },
      
      setError: function(text, displayTime){
         this.setText(text)
         this.getStatusbar().style.setProperty('color', 'red', '')
         displayTime = displayTime?displayTime:3000; 
         setTimeout(this.resetColor, displayTime)
      },
      
      resetColor: function(){
         Statusbar.getStatusbar().style.removeProperty('color')
      }
   }

   this.Statusbar = Statusbar;
}).apply(this)
}