with(this){
(function(){
   /*
    * Maps JS model objects to XUL form elements and vica versa
    */
   var PresentationMapper = {
      
      /*
       * Returns the value of an uiElement
       * @param DOMElement uiElement,
       * @param String defaultProperty (optional): defines defaultProperty which value is given back if UiElement is not known
       */
      getUiElementValue: function(uiElement, defaultProperty){
        switch(uiElement.tagName.toLowerCase()){
            case "checkbox":
               return uiElement.checked
            case "menulist":
            case "radiogroup":   
               return uiElement.selectedItem.value
            case "textbox":   
               return uiElement.value            
            default:
               if(defaultProperty){
                  return uiElement[defaultProperty]
               }else{
                  throw new Error('Unknown UI Element: ' + uiElement.tagName)
               }
         }
      },
      
      /*
       * Maps JS Object to XUL form.
       * The ui elements must have an attribute model which contains the name of
       * the model attribute
       * @param model: JS Object containing the model
       * @param doc: XULDocument containing the ui elements
       * @param defaultProperty: property which should be set if uiElement is not known
       */
      mapModel2Presentation: function(model, doc, defaultProperty){
         Assert.paramsNotNull([model, doc])
         var uiElements = doc.getElementsByAttribute("model", "*")
         for (var i = 0; i < uiElements.length; i++) {
            var uiElement = uiElements.item(i)
            var property = uiElement.getAttribute('model')
            this.setUiElementValue(uiElement, model[property], defaultProperty)
         }
      },

      /*
       * Maps XUL form to JS model object
       * The ui elements must have an attribute model which contains the name of
       * the model attribute
       * @param doc: XULDocument containing the ui elements
       * @param model: JS Object containing the model
       * @param defaultProperty: property which should be set if uiElement is not known
       */
      mapPresentation2Model: function(doc, model, defaultProperty){
         Assert.paramsNotNull([model, doc])
         var uiElements = doc.getElementsByAttribute("model", "*")
         for (var i = 0; i < uiElements.length; i++) {
            var uiElement = uiElements.item(i)
            var property = uiElement.getAttribute('model')
            model[property] = this.getUiElementValue(uiElement, defaultProperty)
         }
      },
      
      /*
       * Select the correct element of menulist or radiogroup according the value attribute
       * of the child elements menulist, radio
       * @param DOMElement choiceElement: Either menulist or radiogroup
       * @param String childElementTagName
       * @param String value: value of the item which should be selected
       */
      selectChoiceElementByValue: function(choiceElement, childrenTagName, value){
         var items = choiceElement.getElementsByTagName(childrenTagName);
         for (var i = 0; i < items.length; i++) {
            if (items[i].value == value) {
               choiceElement.selectedItem = items[i]
               choiceElement.value = value
               return items[i]
            }
         }
      },      

      /*
       * Sets the value of an UI Element
       * @param uiElement
       * @param value: value from model
       * @param defaultProperty (optional): property which should be set if uiElement is not known
       */
      setUiElementValue: function(uiElement, value, defaultProperty){
         if(!value){
            value = ""
         }
         switch(uiElement.tagName.toLowerCase()){
            case "checkbox":
               uiElement.checked = value
               break;
            case "menulist":
               this.selectChoiceElementByValue(uiElement, "menuitem", value)
               break;
            case "radiogroup":   
               this.selectChoiceElementByValue(uiElement, "radio", value)
               break;
            case "textbox":   
               uiElement.value = value            
               break;
            default:
               if(defaultProperty){
                  uiElement[defaultProperty] = value
               }else{
                  throw new Error ('Unknown uiElement ' + uiElement)
               }
         }
      }
      
   }

   this.PresentationMapper = PresentationMapper;
}).apply(this)
}