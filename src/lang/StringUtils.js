with(this){
/**
 * Contain string utility methodes
 */
(function(){
   
   var StringUtils = {
   	digitRegEx: /^\d*$/,
      
      endsWith: function(string, postfix){
         if(this.isEmpty(string) || this.isEmpty(postfix))
            return false
         return string.lastIndexOf(postfix)==string.length-postfix.length 
      },
   	
   	insertAt: function(string, stringToInsert, index){
         return string.substring(0,index) + stringToInsert + string.substring(index)
      },
      
      isDigit: function(string){
   		return this.digitRegEx.test(string)   		
   	},
   	
   	isEmpty: function(string){
   		return string==null || string.length==0
   	},
   	
   	defaultString: function(string){
   		return string!=null?string:""
   	},
      
      firstUpper: function(string){
         if(this.isEmpty(string))
            return string
         var result = string.substring(0,1).toUpperCase()
         if(string.length>1)
            result = result + string.substring(1)
         return result
      },
   	
   	trim: function(string){
   		return string.replace(/^\s*/, "").replace(/\s*$/, "")
   	}
   }
   this["StringUtils"] = StringUtils
}).apply(this)
}