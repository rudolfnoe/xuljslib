with(this){
(function(){
	var XPathUtils = {
      defaultPredicateStrategies: null,
      
		createXPath: function(element, predicateStrategies){
         predicateStrategies= predicateStrategies?predicateStrategies:this.getDefaultPredicateStrategies()
			var result = ""
         var loopElem = element
			do{
            var locationStep = "/" + loopElem.tagName
            var predicateStrategy = null
            for (var i = 0; i < predicateStrategies.length; i++) {
               predicateStrategy = predicateStrategies[i]
               var predicate = predicateStrategy.getPredicate(loopElem)
               if(predicate==null)
                  continue
               locationStep += predicate
               break
            }
				result = locationStep + result
            if(predicateStrategy.isStopFurtherEvalutation(loopElem))
               break
				loopElem = loopElem.parentNode
			}while((loopElem.nodeName!='HTML') && !(loopElem instanceof HTMLDocument))
         
         result = "/" + result
			
         //Test uniqueness
         var elements = this.getElements(result, element.ownerDocument, XPathResult.ORDERED_NODE_ITERATOR_TYPE)
         if(elements.length>1){
            var found = false
            for (var i = 0; i < elements.length; i++) {
               if(element==elements[i]){
                  result = "(" + result + ")[" + (i+1) + "]"
                  found = true
               }
            }
            if(!found)
               throw new Error('invalid xpath expresssion')
            elements = this.getElements(result, element.ownerDocument)
         }
         if(elements.length>1){
            throw new Error ('Bug in createXPath: None unique result even after adding constraints. XPathExp: ' + result)
         }else if(elements.length==0){
            throw new Error ('Bug in createXPath: Result is empty. XPathExp: ' + result)
         }
			return result
		},
      
      getDefaultPredicateStrategies: function(){
         if(!this.defaultPredicateStrategies)
            this.defaultPredicateStrategies = [new AttributePredicateStrategy('id'),
                                          new AttributePredicateStrategy('name'),
                                          new AttributePredicateStrategy('href'),
                                          new DefaultPredicateStrategy()]
         return this.defaultPredicateStrategies
      },
		
		getElements: function(xPath, contextNode, xPathResultType){
			var resultType = xPathResultType?xPathResultType:XPathResult.UNORDERED_NODE_ITERATOR_TYPE
         contextNode = contextNode?contextNode:document
         var doc = (contextNode instanceof HTMLDocument || contextNode instanceof XULDocument || 
            contextNode instanceof Components.interfaces.nsIDOMXMLDocument)?contextNode:contextNode.ownerDocument
			try{
            var xPathResult = doc.evaluate(xPath, contextNode, null, resultType, null)
         }catch(e){
            e.xPath = xPath
            throw e
         }
			var resultArray = []
			while(entry = xPathResult.iterateNext()){
				resultArray.push(entry)
			}
			return resultArray
		},
		
		getElement: function(xPath, contextNode){
			var result = this.getElements(xPath, contextNode)
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
         if(elements.length==1)
            return -1
         for (var i = 0; i < elements.length; i++) {
         	if(elements[i]==element){
         		return i+1
         	}
         }
         return -1
      }
   }
   
	this["XPathUtils"] = XPathUtils;
   
   /* Predicate Strategies */
   function AbstractPredicateStrategy(){
   }
   
   AbstractPredicateStrategy.prototype = {
      constructor: AbstractPredicateStrategy,   
      
      getPredicate: function(element){
         throw new Error ('not implemented')
      }
   }
   
   this["AbstractPredicateStrategy"] = AbstractPredicateStrategy
   
   function DefaultPredicateStrategy(){
   }
   
   DefaultPredicateStrategy.prototype = {
      constructor: DefaultPredicateStrategy,
      
      getPredicate: function(element){
         var position = XPathUtils.getIndexOfElement(element)
         if(position==-1)
            return null
         else
            return "[" + position + "]"
      },
      
      isStopFurtherEvalutation: function(){
         return false
      }
   }
   ObjectUtils.extend(DefaultPredicateStrategy, AbstractPredicateStrategy)
   this["DefaultPredicateStrategy"] = DefaultPredicateStrategy

   function AttributePredicateStrategy(attrName){
      this.attrName = attrName
   }
   
   AttributePredicateStrategy.prototype = {
      constructor: AttributePredicateStrategy,
      
      getPredicate: function(element){
         if(element.hasAttribute(this.attrName)){
            var attrValue = element.getAttribute(this.attrName)
            //Determine which qutoation marks to use
            var quotationMark = StringUtils.contains("'", attrValue)?'"':"'"
            return "[@" + this.attrName + "=" + quotationMark + attrValue + quotationMark + "]"
         }else{
            return null
         }
      },
      
      isStopFurtherEvalutation: function(element){
         return element.hasAttribute(this.attrName)
      }
   }
   ObjectUtils.extend(AttributePredicateStrategy, AbstractPredicateStrategy)
   this["AttributePredicateStrategy"] = AttributePredicateStrategy
   
   function TextContentPredicateStrategy(){
   }
   
   TextContentPredicateStrategy.prototype = {
      constructor: TextContentPredicateStrategy,
      
      getPredicate: function(element){
         var firstTextNode = XPathUtils.getElement(".//text()", element)
         if(!firstTextNode)
            return null
         return "[descendant::text()='" + firstTextNode.nodeValue + "']"
      },
      
      isStopFurtherEvalutation: function(){
         return true
      }
   }
   ObjectUtils.extend(TextContentPredicateStrategy, AbstractPredicateStrategy)
   this["TextContentPredicateStrategy"] =  TextContentPredicateStrategy

}).apply(this)
}