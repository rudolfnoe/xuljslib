with(this){
(function(){
   function CheckboxValueObserver(checkbox){
      var initValue = checkbox.checked
      this.AbstractControlValueObserver(checkbox, initValue)
      this.initEventListener()
   }
   
   CheckboxValueObserver.prototype = {
      constructor: CheckboxValueObserver,
      
      initEventListener: function(){
         this.getTargetElement().addEventListener("CheckboxStateChange", this, true)
      },
      
      handleEvent: function(){
         this.setValue(this.getTargetElement().checked)
      }
   }
   
   ObjectUtils.extend(CheckboxValueObserver, "AbstractControlValueObserver", this)

   this.CheckboxValueObserver = CheckboxValueObserver;
}).apply(this)
}