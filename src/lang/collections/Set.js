with(this){
(function(){
   /*
    * @see ArrayList
    */
   function Set (arg){
      this.ArrayList(arg)
   }
   
   Set.prototype = {
      constructor: Set,
      
      add: function(obj, compareFunc){
         if(!this.contains(obj, compareFunc)){
            this.array.push(obj)
         }
      },
      
      addAll: function(arr, compareFunc){
         Assert.paramsNotNull(arguments)
         if(arr.constructor == Set || arr.constructor == ArrayList){
            arr = arr.array
         }
         for (var i = 0; i < arr.length; i++) {
            this.add(arr[i], compareFunc)
         }
      },
      
      addAllAtIndex: function(index, arr){
         Assert.fail("Not supported")
      },
      
      addAtIndex: function(index, obj){
         Assert.fail("Not supported")
      },
      
      set: function(index, obj, compareFunc){
         Assert.fail("Not supported")
      }
   }
   
   ObjectUtils.extend(Set, "ArrayList", this)
   this.Set = Set;
   
}).apply(this)
}