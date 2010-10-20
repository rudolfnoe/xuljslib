with(this){
(function(){
   var UIUtils = {
      isPopupOpen : function(doc) {
         doc = doc?doc:document
         var popupsets = doc.getElementsByTagName("popupset")
         for (var i = 0; i < popupsets.length; i++) {
            var popups = popupsets[i].childNodes
            for (var j = 0; j < popups.length; j++) {
               if (popups[j].state == "open") {
                  return true
               }
            }
         }
         return false
      }
   }

   this.UIUtils = UIUtils;
}).apply(this)
}