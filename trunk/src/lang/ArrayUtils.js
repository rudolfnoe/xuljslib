with(this){
(function(){
   var ArrayUtils = {
      cloneArray: function(array){
         if(array==null)
            throw new Error('null pointer exception')
         var arr = new Array(array.length)
         for (var i = 0; i < array.length; i++) {
            arr[i] = array[i]
         }
         return arr
      }
   }

   this.ArrayUtils = ArrayUtils;
}).apply(this)
}