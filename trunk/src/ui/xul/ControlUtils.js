with(this){
/*
 * 
 * Common-Prefs Version 0.1 Created by Rudolf Noe 28.12.2007
 * 
 * Partly copied from pref-tabprefs.js (c) Bradley Chapman (THANKS!)
 */
(function() {
   const CONTROL_LISTENER_BACKUP_VALUE = "CONTROL_LISTENER_BACKUP_VALUE"
   
	// Attribute of a control under which key the preference should be stored
	var ControlUtils = {
      EventType: {VALUE_CHANGED:"VALUE_CHANGED"},
      
		/*
		 * Appends menuitem to menulist
		 */
		appendItemToMenulist: function(menulist, label, value){
			if(menulist==null || label==null || value==null){
			   throw new Error("Arguments must not be null")
			}
		   var newItem = document.createElementNS(Constants.XUL_NS, "menuitem");
         newItem.setAttribute('label', label)
         newItem.setAttribute('value', value);
         menulist.menupopup.appendChild(newItem)
		},
		
		/*
		 * Adds menuitems for a array of labels and values, 
		 * Only new items with different values will be added 
		 * @param in menulist menulist
		 * @param in String[] labelArray
		 * @param in String[] valueArray
		 */
		appendItemsToMenulist: function(menulist, labelArray, valueArray){
		   var itemsMap = new Map()
		   var menuitems = menulist.getElementsByTagName('menuitem')
		   for (var i = 0; i < menuitems.length; i++) {
		   	itemsMap.put(menuitems[i].value)
		   }
		   for (var i = 0; i < labelArray.length; i++) {
		   	var value = valueArray[i]
		   	if(itemsMap.containsKey(value))
		   	   continue;
		   	menulist.appendItem(labelArray[i], value, null);
		   }
		},
		
		clearMenulist: function(menulist){
		   var menupopup = menulist.menupopup
		   while(menupopup.hasChildNodes()){
		   	menupopup.removeChild(menupopup.firstChild)
		   }
		},
      
      filterMenulist: function(menulist, value){
         if(value==null)
            value = menulist.value
         value = value.toLowerCase()
         var parts = value.split(" ")
         var menuitemsFit = new Array()
         for (var i = 0; i < menulist.itemCount; i++) {
            var fit = true
            var menuitem = menulist.getItemAtIndex(i)
            var startindex = 0
            for (var j = 0; j < parts.length; j++) {
               var menuItemValue = (menuitem.value?menuitem.value:menuitem.label).toLowerCase()
               startindex = menuItemValue.indexOf(parts[j], startindex)
               if(startindex==-1){
                  fit = false
                  break;
               }
               startindex += parts[j].length
            }
            if(!fit)
               menuitem.style.display = "none"
            else{
               menuitem.style.display = "block";
               menuitemsFit.push(menuitem)
            }
         }
      },
      
      insertTextAt : function(element, textToInsert, insertAt, after) {
			var newSelectionEnd = element.selectionEnd
			var newSelectionStart = element.selectionStart
         if(!after){
   			newSelectionEnd += textToInsert.length;
   			newSelectionStart += textToInsert.length;
         }
			var currentValue = element.value;

			var beforeText = currentValue.substring(0, insertAt);
			var afterText = currentValue.substring(insertAt);

			//Save scroll top as it will be reset on setting value
         var scrollTop = element.inputField.scrollTop
         
         //Set new value
         element.value = beforeText + textToInsert + afterText;
         
         //Restore scrollTop
         element.inputField.scrollTop = scrollTop

			element.setSelectionRange(newSelectionStart, newSelectionEnd);
		},  
      
      insertTextAtCursorPos: function(element, textToInsert, after){
         this.insertTextAt(element, textToInsert, element.selectionEnd, after)
      },
      
      
      observeControl: function(control, /*function | EventHandler*/ callbackFuncOrEventHandler, /*Object (optional)*/ thisObj){
         //Defintion of callback function
         var notifyCallback = function(control, newValue){
            if(newValue!=control.getAttribute(CONTROL_LISTENER_BACKUP_VALUE)){
               control.setAttribute(CONTROL_LISTENER_BACKUP_VALUE, control.value)
            }else{
               //No change
               return
            }
               
            if(callbackFuncOrEventHandler.handleEvent){
               //EventHandler   
               var event = {type:ControlUtils.EventType.VALUE_CHANGED, target:control, value:newValue};
               callbackFuncOrEventHandler.handleEvent(event)
            }else{
               var callBack = thisObj?Utils.bind(callbackFuncOrEventHandler, thisObj):callbackFuncOrEventHandler;
               callBack(control, newValue);
            }
         }
         //Adding event listener
         var tagName = control.localName.toLowerCase() 
         control.setAttribute(CONTROL_LISTENER_BACKUP_VALUE, control.value)
         if(tagName=="menulist" || "colorfield"){
            control.addEventListener("select", function(){
              notifyCallback(control, control.value)
            }, true)
         }
         if(tagName=="textbox" || tagName=="menulist" || tagName=="colorfield"){
            control.addEventListener("input", function(event){
               var tagName = event.target.tagName;
               notifyCallback(control, control.value)
            }, true)
            Utils.observeObject(control, "value", function(newValue){
               notifyCallback(control, newValue)
            })
         }else if(tagName=="checkbox"){
            control.addEventListener("command", function(){
               notifyCallback(control, control.checked)
            }, true)
            Utils.observeObject(control, "checked", function(newValue){
               notifyCallback(control, newValue)
            })
         }
      },
		
		/*
		 * Selects item of menulist by its value and returns the item 
		 */
		selectMenulistByValue : function(menulist, value) {
			PresentationMapper.setUiElementValue(menulist, value);
		},
		
		selectRadiogroupByValue: function(radiogroup, value){
			PresentationMapper.setUiElementValue(radiogroup, value);
		}
	}
	this["ControlUtils"]= ControlUtils;
}).apply(this)
}