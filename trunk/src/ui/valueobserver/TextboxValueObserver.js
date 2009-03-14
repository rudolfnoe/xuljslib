with(this){
(function(){
   function TextboxValueObserver(textbox){
      this.AbstractControlValueObserver(textbox, textbox.value)
      this.initEventListener()
   }
   
   TextboxValueObserver.prototype = {
      constructor: TextboxValueObserver,
      
      initEventListener: function(){
         this.getTargetElement().addEventListener("input", this, true)
      },
      
      handleEvent: function(){
         this.setValue(this.getTargetElement().value)
      }
   }
   
   ObjectUtils.extend(TextboxValueObserver, "AbstractControlValueObserver", this)

   this.TextboxValueObserver = TextboxValueObserver;
}).apply(this)
}