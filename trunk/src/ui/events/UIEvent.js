with(this){
(function(){
   function UIEvent(type){
      this.UIEvent(type)
   }
   ObjectUtils.extend(UIEvent, "EventBase", this)
   this.UIEvent = UIEvent;
}).apply(this)
}