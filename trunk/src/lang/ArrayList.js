with(this){
(function(){   
   function ArrayList (arg){
   	if(arg!=null){
   		if(arg.constructor ==Array){
      		this.array = new Array()
   			for (var i = 0; i < arg.length; i++) {
   				this.add(arg[i])
   			}
   	   }else{
   	   	this.array = new Array(arg)
   	   }
   	}else{
   		this.array = new Array()
   	}
   }
   
   ArrayList.prototype = {
      constructor: ArrayList,
      
      add: function(obj){
         this.array.push(obj)
      },
      
      addAll: function(arr){
         if(arr.constructor == ArrayList){
         	arr = arr.array
         }
         for (var i = 0; i < arr.length; i++) {
         	this.add(arr[i])
         }
      },
      
      addAtIndex: function(index, obj){
      	this.array = this.array.slice(0,index).concat(obj).concat(this.array.slice(index))
      },
      
      clear: function(){
      	this.array = new Array()
      },
      
      contains: function(obj, compareFunc){
      	if(compareFunc){
            return this.array.some(function(element, index, array){
            	compareFunc(obj, element)
            })
      	}else{
         	return this.array.indexOf(obj)!=-1
      	}
      },
      
      get: function(index){
      	if(index>this.array.length-1){
      		throw new Error("ArrayList.get: IndexOutOfBounds")
      	}
      	return this.array[index]
      },
      
      indexOf: function(obj){
         return this.array.indexOf(obj)   
      },

      removeAtIndex: function(index){
      	this.array = this.array.slice(0,index).concat(this.array.slice(index+1))
      },
      
      remove: function(obj){
      	this.remove(this.array.indexOf(obj))
      },
      
      set: function(index, obj){
      	this.array[index] = obj
      },
      
      size: function(){
      	return this.array.length
      },
      
      toArray: function(){
      	var newArray = new Array()
      	for (var i = 0; i < this.array.length; i++)
      		newArray.push(this.get(i))
      	return newArray
      },
      
      toString: function(){
      	return "ArrayList: " + this.array.toString()
      }
      
      
   }
   this["ArrayList"]= ArrayList;   
}).apply(this)
}