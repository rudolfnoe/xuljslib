with(this){
(function(){
	var XPathUtils = {
		createXPath: function(element){
			var result = ""
			var doBreak = false
         var loopElem = element
			do{
				if(loopElem.hasAttribute('id')){
					result = "id('" + loopElem.id + "')" + result
					break
				}
				if(loopElem.hasAttribute('name')){
					result = "[@name='" + loopElem.getAttribute('name') + "']" + result
					doBreak = true
				}
            //As result is not need to be unique if removed this.
				/*if(loopElem.hasAttribute('href')){
					result = "[@href='" + loopElem.getAttribute('href') + "']" + result
					doBreak = true
				}*/
				if(!doBreak){
					var index = this.getIndexOfElement(loopElem)
					if(index!=-1){
						result = "[" + index + "]" + result
					}
				}
				result = "/" + loopElem.tagName + result
				if(doBreak){
              result = "/" + result					
				  break;
				}
				loopElem = loopElem.parentNode
			}while(loopElem.nodeName!='#document')
			
         //Test uniqueness
         var elements = this.getElements(result, element.ownerDocument)
         if(elements.length>1){
            throw new Error ('Bug in createXPath: Result is not unique. XPathExp: ' + result)
         }else if(elements.length==0){
            throw new Error ('Bug in createXPath: Result is empty. XPathExp: ' + result)
         }
			return result
		},
		
		getElements: function(xPath, doc, xPathResultType){
			var resultType = xPathResultType?xPathResultType:XPathResult.UNORDERED_NODE_ITERATOR_TYPE
         doc = doc?doc:document
			var xPathResult = doc.evaluate(xPath, doc, null, resultType, null)
			var resultArray = []
			while(entry = xPathResult.iterateNext()){
				resultArray.push(entry)
			}
			return resultArray
		},
		
		getElement: function(xPath, doc){
			var result = this.getElements(xPath, doc)
			if(result.length>0){
				return result[0]
			}else{
				null
			}
		},

		//Returns the index of element within parent with this tagname
      getIndexOfElement: function(element){
         var parent = element.parentNode
         if(parent==null){
         	return -1
         }
         var elements = DomUtils.getChildrenBy(parent, function(node){
            return node.tagName == element.tagName
         })
         for (var i = 0; i < elements.length; i++) {
         	if(elements[i]==element){
         		return i+1
         	}
         }
         return -1
      }
   }
   
	this["XPathUtils"] = XPathUtils;
}).apply(this)
}