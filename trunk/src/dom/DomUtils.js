with(this){
(function() {
   var DomUtils = {
      
      //Taken from firebug, see firebug-license.txt
      addStyleSheet : function(doc, link) {
         var heads = doc.getElementsByTagName("head");
         if (heads.length)
            heads[0].appendChild(link);
         else
            doc.documentElement.appendChild(link);
      },
      
      assureStyleSheet: function(doc, url){
         var styleSheets = doc.styleSheets
         var included = false
         for (var i = 0; i < styleSheets.length; i++) {
            if(styleSheets[i].href==url){
               included = true
               break;
            }
         }
         if(included){
            return
         }
         var link = this.createStyleSheet(doc, url)
         this.addStyleSheet(doc, link)
      },
      
      containsFrames: function(win){
      	return win.frames.length>0
      },
      
      //Taken from firebug, see firebug-license.txt
      createStyleSheet : function(doc, url) {
         var link = doc.createElementNS("http://www.w3.org/1999/xhtml", "link");
         link.setAttribute("charset", "utf-8");
         link.firebugIgnore = true;
         link.setAttribute("rel", "stylesheet");
         link.setAttribute("type", "text/css");
         link.setAttribute("href", url);
         return link;
      },

      //Taken from firebug and modified, see firebug-license.txt
      getBody : function(doc) {
         if (doc.body)
            return doc.body;
         var bodyElems = doc.getElementsByTagName("body")
         return bodyElems.length>0?bodyElems[0]:null
      },
      
      getChildrenBy: function(element, testFunction){
         var result = new Array()
         var childNodes = element.childNodes
         for (var i = 0; i < childNodes.length; i++) {
            if(testFunction(childNodes[i]))
               result.push(childNodes[i])
         }
         return result
      },
      
      getElementType: function(element){
         if(!element || !element.tagName)
               return null;
         var tagName = element.tagName
         var type = element.type?element.type.toLowerCase():""

         if(tagName == "INPUT"){
            if(type=="text")
               return HtmlElementType.TEXT
            else if(type=="password")
               return HtmlElementType.PASSWORD
            else if(type=="radio")
               return HtmlElementType.RADIO
            else if(type=="checkbox")
               return HtmlElementType.CHECKBOX
            else if(type=="file")
               return HtmlElementType.FILE
         }else if(tagName == "SELECT")
            return HtmlElementType.SELECT
         else if(tagName == "TEXTAREA")
            return HtmlElementType.TEXTAREA
         else if(tagName == "BUTTON" || 
            (tagName == "INPUT" && ( type == "button" || type == "submit" || type == "reset" || type == "image"))){
            return HtmlElementType.BUTTON
         } else {
            return HtmlElementType.OTHER
         }
      },
      
      getFirstChildBy: function(element, testFunction){
         if(!element.hasChildNodes())
            return null
         var children = element.childNodes
         for (var i = 0; i < children.length; i++) {
            if(testFunction(children[i]))
               return children[i]
         }
         return null;
      },
      
      getFrameByName: function(win, name){
      	var result = null
      	this.iterateWindows(win, function(subWin){
      	  if(subWin.name == name)
      	     result = subWin
      	})
      	return result
      },
      
      getFrameByLocationHref: function(win, href){
         var result = null
         this.iterateWindows(win, function(subWin){
           if(subWin.location.href == href)
              result = subWin
         })
         return result
      },

      getFrameByHrefRegExp: function(win, hrefRegExp){
         var result = new Array()
         this.iterateWindows(win, function(subWin){
           if(hrefRegExp.test(subWin.location.href))
              result.push(subWin)
         })
         return result
      },

      getNextElementSibling: function(element){
         var node = element.nextSibling 
         while(node){
            if(node.nodeType==1)
               break
            node = node.nextSibling
         }
         return node
      },
      
      /*
       * @param element: element for which offset should be computed @param
       * leftOrTop: values offsetLeft/offsetTop
       */
      getOffsetToBody : function(element) {
         var offset = {}
         offset.y = element.offsetTop
         offset.x = element.offsetLeft
         while (element.offsetParent != null) {
            element = element.offsetParent
            offset.y += element.offsetTop
            offset.x += element.offsetLeft
         }
         return offset
      },
      
      getOwnerWindow: function(element){
      	return element.ownerDocument.defaultView
      },
      
      getPreviousElementSibling: function(element){
         var node = element.previousSibling 
         while(node){
            if(node.nodeType==1)
               break
            node = node.previousSibling
         }
         return node
      },

      isFramesetWindow: function(win){
         if(this.getBody(win.document)==null && win.doc.getElementsByTagName('frameset').length>0)
            return true
         else
            return false
      },
      
      iterateDescendantsByTagName: function(element, descendantTagName, funcPointer){
      	var descendants = element.getElementsByTagName(descendantTagName)
      	for (var i = 0; i < descendants.length; i++) {
      		funcPointer(descendants[i])
      	}
      },
      
      // Taken from firebug, see firebug-license.txt
      iterateWindows : function(win, handler) {
         if (!win || !win.document)
            return;

         handler(win);

         if (win == top)
            return; // XXXjjb hack for chromeBug

         for (var i = 0; i < win.frames.length; ++i) {
            var subWin = win.frames[i];
            if (subWin != win)
               this.iterateWindows(subWin, handler);
         }
      },
      
      moveTo: function(elt, x, y){
         elt.style.left = x + "px"
         elt.style.top = y + "px"
      },
      
      //Taken from firebug, see firebug-license.txt
      ownerDocIsFrameset: function(elt){
         var body = this.getBody(elt.ownerDocument);
         if(body==null)
            return false
         return body.localName.toUpperCase() == "FRAMESET"
      },
      
      removeElement: function(element){
         var parentNode = element.parentNode
         if(!parentNode)
            return false
         return parentNode.removeChild(element) 
      },
      
      resizeTo: function(elt, w, h){
         elt.style.width = w + "px"
         elt.style.height = h + "px"
      }
   }
   this["DomUtils"] = DomUtils;
   
   HtmlElementType = {
      BUTTON: "BUTTON",
      CHECKBOX: "CHECKBOX",
      FIELDSET: "FIELDSET",
      FILE: "FILE",
      IFRAME: "IFRAME",
      OTHER: "OTHER",
      PASSWORD: "PASSWORD",
      RADIO: "RADIO",
      SELECT: "SELECT",
      TEXT: "TEXT",
      TEXTAREA: "TEXTAREA",
   }
   this["HtmlElementType"] = HtmlElementType
      
}).apply(this)
}