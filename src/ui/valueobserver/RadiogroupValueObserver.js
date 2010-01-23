with(this){
(function(){
   function RadiogroupValueObserver(radiogroup){
      var initValue = radiogroup.selectedItem?radiogroup.selectedItem.value:null
      this.AbstractControlValueObserver(radiogroup, initValue)
      this.initEventListener()
   }
   
   RadiogroupValueObserver.prototype = {
      constructor: RadiogroupValueObserver,
      
      initEventListener: function(){
         this.getTargetElement().addEventListener("select", this, true)
      },
      
      handleEvent: function(){
         this.setValue(this.getTargetElement().selectedItem.value)
      }
   }
   
   ObjectUtils.extend(RadiogroupValueObserver, "AbstractControlValueObserver", this)

   this.RadiogroupValueObserver = RadiogroupValueObserver;
}).apply(this)
}