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
      },
      
      contains: function(array, value){
         return array.indexOf(value)!=-1
      },
      
      copy: function(array){
         Assert.paramsNotNull(arguments)
         var resultArr = new Array(array.length)
         for (var i = 0; i < array.length; i++) {
            resultArr[i] = array[i]
         }
         return resultArr 
      },
      
      concatAsSet: function(array1, array2){
         Assert.paramsNotNull(arguments)
         var resultArr = this.copy(array1)
         for (var i = 0; i < array2.length; i++) {
            var elm = array2[i]
            if(resultArr.indexOf(elm)==-1){
               resultArr.push(elm)
            }
         }
         return resultArr
      }
   }

   this.ArrayUtils = ArrayUtils;
}).apply(this)
}