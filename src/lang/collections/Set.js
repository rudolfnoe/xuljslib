with(this){
(function(){   
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
            this.add(obj, compareFunc)
         }
      },
      
      addAllAtIndex: function(index, arr){
         Assert.fail("Not supported")
      },
      
      addAtIndex: function(index, obj){
         Assert.fail("Not supported")
//         if(index<0 || index>this.array.length)
//            throw new Error('IndexOutOfBounds')
//         if(index==this.array.length)
//            this.array.push(obj)
//         else
//           this.array = this.array.slice(0,index).concat(obj).concat(this.array.slice(index))
      },
      
      set: function(index, obj, compareFunc){
         Assert.fail("Not supported")
      }
   }
   
   ObjectUtils.extend(Set, "ArrayList", this)
   this.Set = Set;
   
}).apply(this)
}