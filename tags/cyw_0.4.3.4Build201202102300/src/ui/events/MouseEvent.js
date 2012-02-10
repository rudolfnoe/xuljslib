with(this){
(function(){
   function MouseEvent(type){
      this.EventBase(type)
      this.button = 0
      this.clickCount = 1
      this.clientX = 0
      this.clientY = 0
      this.modifierMask = 0
      this.screenX = 0
      this.screenY = 0
      this.view = null
   }
   
   MouseEvent.prototype = {
      constructor: MouseEvent,

      getButton: function(){
         return this.button
      },

      setButton: function(button){
         this.button = button
      },

      getClientX: function(){
         return this.clientX
      },

      setClientX: function(clientX){
         this.clientX = clientX
      },

      getClientY: function(){
         return this.clientY
      },

      setClientY: function(clientY){
         this.clientY = clientY
      },

      getClickCount: function(){
         return this.clickCount
      },

      setClickCount: function(clickCount){
         this.clickCount = clickCount
      },

      getModifierMask: function(){
         return this.modifierMask
      },

      setModifierMask: function(modifierMask){
         this.modifierMask = modifierMask
      },

      getScreenX: function(){
         return this.screenX
      },

      setScreenX: function(screenX){
         this.screenX = screenX
      },

      getScreenY: function(){
         return this.screenY
      },

      setScreenY: function(screenY){
         this.screenY = screenY
      },

      getView: function(){
         return this.view
      },

      setView: function(view){
         this.view = view
      },
      
      dispatch: function(target){
         var event = target.ownerDocument.createEvent("MouseEvents")
         event.initMouseEvent(this.getType(), 
                                 this.isBubbles(), 
                                 this.isCancelable(), 
                                 target.ownerDocument.defaultView, 
                                 this.clickCount, 
                                 this.screenX, this.screenY, this.clientX, this.clientY,
                                 this.modifierMask & Event.CONTROL_MASK, 
                                 this.modifierMask & Event.ALT_MASK, 
                                 this.modifierMask & Event.SHIFT_MASK, 
                                 this.modifierMask & Event.META_MASK,
                                 this.button,
                                 null) //relatedTarget

         return target.dispatchEvent(event)
      }
      
      
   }
   
   ObjectUtils.extend(MouseEvent, "EventBase", this)

   this.MouseEvent = MouseEvent;
}).apply(this)
}