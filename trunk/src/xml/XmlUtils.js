with(this){
/*
 * Version 0.1
 * Created by Rudolf Noé
 * 28.12.2007
 * 
 * XML Utilities
 */

(function(){
	var XMLUtils = {
		VERSION: "0.2",
		NON_WHITE_SPACE_REGEX: /[^\s]/,
		
		/*
		 * Parses an xmlString and returns and XML-Object not an DOM-Node!!!
		 * @param xmlString to parse
		 * @returns XML-object
		 */
		parseFromString: function(xmlString){
         Assert.paramsNotNull(arguments)
			var parser = new DOMParser()
			var domDoc = parser.parseFromString(xmlString, "text/xml")
         if(domDoc.getElementsByTagName('parsererror').length>0){
            var errorDescription = domDoc.documentElement.textContent
            throw new Error(errorDescription)
         }
         return domDoc
		},
		
		/*
		 * Serialize a Node-object to a string
		 * @param node: DOM-Node-obj
		 * @returns: String containing the xml
		 */
		serializeToString: function(node){
			var serializer = new XMLSerializer();
			return serializer.serializeToString(node)
		},
		
		/*
		 * Checks case insensitive whether the element has the provided tagname
		 * @param element: DOM-Element
		 * @param tagName: string with tagname
		 */
		isTagName: function(element, tagName){
	        if(!element || !element.tagName)
	            return false;
	        return element.tagName.toUpperCase()==tagName.toUpperCase();
	    },
	    
	    /*
	     * Checks whether a text node is empty or contains at least only withespace characters
	     * @param element: DOM-Node
	     */
	    isEmptyTextNode: function(element){
	        if(element.nodeType==Node.TEXT_NODE && element.nodeValue!=null && !this.NON_WHITE_SPACE_REGEX.test(element.nodeValue))
	            return true
	        else
	            return false;
	    },
	    
	    containsNoText:function(element){
         if(this.NON_WHITE_SPACE_REGEX.test(element.text)){
         	return false
         }else{
         	return true
         }
	    }
	}
	this["XMLUtils"] = XMLUtils;
	
}).apply(this)
}