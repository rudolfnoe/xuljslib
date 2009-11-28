with(this){
(function(){
   function LinkWrapper(link){
      this.link = link      
   }
   
   LinkWrapper.prototype = {
      constructor: LinkWrapper,
      open: function(where){
         if(where == LinkTarget.CURRENT){
            var clickEvent = new MouseEvent("click")
            clickEvent.dispatch(this.link)
         }else{
            //Use FF method
            openUILinkIn(this.link.href, where)
         }
      }
   }

   this.LinkWrapper = LinkWrapper;
   
   LinkTarget = {
      CURRENT:"current",
      TAB:"tab",
      WINDOW:"window"
   }
   this.LinkTarget = LinkTarget;
}).apply(this)
}