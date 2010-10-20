with(this){
(function(){
   var Assert = {
      
      fail: function(message){
         this.isTrue(false, message)   
      },
      
      isFalse: function(cond, message){
         this.isTrue(!cond, message)
      },
      
      isTrue: function(cond, message){
         if(!cond){
            var err = new Error()
            message = message?message:""
            message += "  Stack: " + err.stack
            throw new Error(message)
         }
      },
      
      notNull: function(obj, message){
         this.isTrue(obj!=null, message)
      },
      
      paramNotNull: function(obj, paramName){
         this.isTrue(obj!=null, "Param " + paramName + " must not be null")
      },
      
      paramsNotNull: function(objArr, paramNameArr){
         for (var i = 0; i < objArr.length; i++) {
            this.isTrue(objArr[i]!=null, "Param " + (paramNameArr?paramNameArr[i]:(i+1)) + " must not be null")
         }
      }
   }

   this.Assert = Assert;
}).apply(this)
}