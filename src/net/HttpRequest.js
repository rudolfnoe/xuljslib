with(this){
(function(){
   function HttpRequest(){
      this.request = XMLHttpRequest()
      this.request.onreadystatechange = new EventHandlerAdapter(this.onreadystatechange, this)
      this.eventManager = new GenericEventSource()
   }
   
   HttpRequest.METHOD = {
      GET: 'GET'
   }
   
   HttpRequest.EVENT_TYPE = {
      ON_SUCCESS: "ON_SUCCESS",
      ON_ERROR: "ON_ERROR"
   }
   
   HttpRequest.prototype = {
      constructor: HttpRequest,
      
      addEventListener: function(type, callbackFuncOrEventHandler, thisObj){
         Assert.isTrue(ObjectUtils.containsValue(HttpRequest.EVENT_TYPE, type), "Unsupported event")
         this.eventManager.addListener(type, callbackFuncOrEventHandler, thisObj)
      },
      
      getResponseText: function(){
         return this.request.responseText   
      },
      
      send: function(method, url, asynchronously){
         Assert.isTrue(ObjectUtils.containsValue(HttpRequest.METHOD, method), "Unsupported method")
         Assert.notNull(url, "url must be provided")
         asynchronously = arguments.length>=3?asynchronously:true
         this.request.open(method, url, asynchronously)
         this.request.send(null);
      },
      
      onreadystatechange: function(){
         if(this.request.readyState!=4){
            return
         }
         var event = null
         if(this.request.status==200){//OK
            event = {type:HttpRequest.EVENT_TYPE.ON_SUCCESS}
         }else{
            event = {type:HttpRequest.EVENT_TYPE .ON_ERROR}
         }
         this.eventManager.notifyListeners(event)
      }
   }

   this.HttpRequest = HttpRequest;
}).apply(this)
}