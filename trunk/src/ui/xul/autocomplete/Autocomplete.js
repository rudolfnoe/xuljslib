with(this){
(function(){
   const LISTENING_EVENTS_OF_POPUP = ["dblclick", "popuphiding"];
   
   function Autocomplete(targetElement, searchHandler){
      Assert.paramsNotNull(arguments)
      this.targetElement = targetElement
      Assert.notNull(this.targetElement)
      this.resultPopup = null
      this.searchHandler = searchHandler
      this.searchResults = null
      this.scm = new ShortcutManager(window, "keypress", true, true)
      var isMenulist = this.targetElement.localName.toLowerCase()=="menulist"
      this.targetTextbox = isMenulist?this.targetElement.inputField:this.targetElement
      this.timerId = (new Date()).getTime()
      
      this.initForPopupClosed()
   }
   
   Autocomplete.prototype = {
      constructor: Autocomplete,
      
      commitSelected: function(){
         var selectedIndex = this.getResultListbox().selectedIndex
         if(selectedIndex>=0){
            var selectedEntry = this.searchResults[selectedIndex]
            this.targetElement.value = selectedEntry.getValue()
            this.targetTextbox.selectionStart = selectedEntry.getSelectionStart()
            this.targetTextbox.selectionEnd = selectedEntry.getSelectionEnd();
            this.hideResultPopup()
         }
      },
      
      createResultPopup: function(){
         var rootElement = document.documentElement
         var popupset = document.createElement("popupset")
         rootElement.appendChild(popupset)
         var resultPopup = document.createElement("panel")
         resultPopup.setAttribute("ignorekeys", "true")
         resultPopup.setAttribute("noautofocus", "true")
         popupset.appendChild(resultPopup)
         return resultPopup
      },
      
      destroy: function(){
         if(this.resultPopup){
            this.hideResultPopup();
            DomUtils.removeElement(this.resultPopup)
         }
         this.scm.destroy()
      },
      
      fillResultPopup: function(results){
         var resultPopup = this.getResultPopup()
         while(resultPopup.firstChild){
            resultPopup.removeChild(resultPopup.firstChild)
         }
         var listbox = document.createElement("listbox")
         listbox.setAttribute("seltype", "single")
         resultPopup.appendChild(listbox)
         for (var i = 0; i < results.length; i++) {
            var result = results[i]
            var li = Listbox.appendMultiColumnItem(listbox, [result.getText()], [result.getValue()], result.getValue())
         }
      },
      
      getResultListbox: function(){
         return this.getResultPopup().getElementsByTagName('listbox')[0]
      },
      
      getResultPopup: function(){
         if(this.resultPopup==null){
            this.resultPopup = this.createResultPopup()
         }
         return this.resultPopup
      },
      
      hideResultPopup: function(){
         this.getResultPopup().hidePopup()
      },
      
      openAutocomplete: function(){
         var sucessfull = this.search()
         if(!sucessfull){
            return
         }
         this.fillResultPopup(this.searchResults)
         this.scm.clearAllShortcuts()
         this.initForPopupOpen();
         this.getResultPopup().openPopup(this.targetElement, "after_start")
      },
      
      handleDblclick: function(){
         this.commitSelected()
      },
      
      handleInput: function(){
         Utils.executeDelayed(this.timerId, 300, function(){
            var sucessfull = this.search()
            if(sucessfull){
               this.fillResultPopup(this.searchResults)
            }else{
               this.hideResultPopup()
            }
         }, this) 
      },
      
      handlePopuphiding: function(){
         this.searchResults = null
         this.scm.clearAllShortcuts()
         this.targetTextbox.removeEventListener("input", this, true)
         this.unRegisterMultipleEventListener(this.getResultPopup(), LISTENING_EVENTS_OF_POPUP, true);
         this.initForPopupClosed()
      },
      
      initForPopupClosed: function(){
         this.scm.addShortcutForElement(this.targetElement, "ctrl+space", this.openAutocomplete, this)
      },
      
      initForPopupOpen: function(){
         //All shortcuts are registered on the window otherwise the default behavior of target element 
         //like opening popup of menulist could not be suppressed
         this.scm.addShortcut("Escape", this.hideResultPopup, this)   
         this.scm.addShortcut("Return", this.commitSelected, this)   
         this.scm.addShortcut("Down", this.selectNextResult, this)   
         this.scm.addShortcut("Up", this.selectPreviousResult, this)

         this.targetTextbox.addEventListener("input", this, true);
         this.registerMultipleEventListener(this.getResultPopup(),  LISTENING_EVENTS_OF_POPUP, true)
      },
      
      search: function(){
         this.searchResults = this.searchHandler.search(this.targetElement.value, 
                                                         this.targetTextbox.selectionStart, 
                                                         this.targetTextbox.selectionEnd)
         return this.searchResults && (this.searchResults.length > 0)
      },
      
      selectNextResult: function(){
         var lb = this.getResultListbox()
         if(lb.selectedIndex < lb.itemCount-1){
            lb.selectedIndex = lb.selectedIndex+1
         }
      },
      
      selectPreviousResult: function(){
         var lb = this.getResultListbox()
         if(lb.selectedIndex > 0){
            lb.selectedIndex = lb.selectedIndex-1
         }
      }
   };
   
   ObjectUtils.extend(Autocomplete, "AbstractGenericEventHandler", this);
   
   this.Autocomplete = Autocomplete;
}).apply(this)
};