with(this){
/**
 * Contain string utility methodes
 */
(function(){
   
   var StringUtils = {
   	digitRegEx: /^\d*$/,
      
   	contains: function(needle, haystack){
         return haystack && (haystack.indexOf(needle)!=-1)
      },
      
      defaultString: function(string, defaultString){
         var defaultString = defaultString?defaultString:""
   		return string!=null?string:defaultString
   	},
      
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
   	
      firstUpper: function(string){
         if(this.isEmpty(string))
            return string
         var result = string.substring(0,1).toUpperCase()
         if(string.length>1)
            result = result + string.substring(1)
         return result
      },
      
      /*
       * @param string string: string to test
       * @param string matchExp: expr to test agains string; * and spaces are interpreted as reg ex (.*?)  
       */
      matches: function(string, matchExp, ignoreCase){
         var ignoreCase = arguments.length>=3?ignoreCase:false
         matchExp = this.trim(matchExp)
         matchExp = matchExp.replace(/\s+/, "*")
         matchExp = matchExp.replace(/\*/, ".*?")
         matchExp = matchExp.replace(/\?/, ".{0,1}")
         var regExp = new RegExp("^" + matchExp, (ignoreCase?"i":""))
         return regExp.test(string)
      },
      
      removeWhitespace: function(string){
         if(this.isEmpty(string))
            return string
         return string.replace(/\s/g, "")
      },
   	
   	startsWith: function(string, prefix){
         if(this.isEmpty(string))
            return false
         return string.indexOf(prefix)==0   
      },
      
      trim: function(string){
   		return string.replace(/^\s*/, "").replace(/\s*$/, "")
   	}
   }
   this["StringUtils"] = StringUtils
}).apply(this)
}