with(this){
(function(){
   function EventBase(type){
      this.bubbles = true
      this.cancelable = true
      this.type = type
   }
   
   EventBase.prototype = {
      constructor: EventBase,
      EventBase: EventBase,
      
      isBubbles: function(){
         return this.bubbles
      },

      setBubbles: function(bubbles){
         this.bubbles = bubbles
      },

      isCancelable: function(){
         return this.cancelable
      },

      setCancelable: function(cancelable){
         this.cancelable = cancelable
      },

      getTarget: function(){
         return this.target
      },

      setTarget: function(target){
         this.target = target
      },

      getType: function(){
         return this.type
      },

      setType: function(type){
         this.type = type
      },
      
      dispatch: function(target){
         var event = target.ownerDocument.createEvent("HTMLEvents")
         event.initEvent(this.type, this.bubbles, this.cancelable)
         target.dispatchEvent(event)
      }
   }

   this.EventBase = EventBase;
}).apply(this)
}