with(this){
/* DotNetRemoting JavaScript Serializer/Deserializer
 * Orignial Author Dan Wellmann Thanks!!!
 * Downloaded from http://dotnetremoting.com/  
 * */

(function(){
	
      /* main entry for serialization
       * JavaScript object as an input
       * usage: JSerialize(MyObject);
       * @ObjectToSerialize: Object which should be serialized
       * @objectName: Name of the root object
       * @indentSpace: String with spaces which is used to indent output
       * @ommitFunction: Boolean indicating whether functions should be serialized or not
       * @prefixOfTransientMembers: If attribute of object has this prefix it will not be serialized 
       */
      function JSerialize(ObjectToSerialize, objectName, indentSpace, ommitFunctions, prefixOfTransientMembers)
      {
         indentSpace = indentSpace?indentSpace:'';
         
         var Type = GetTypeName(ObjectToSerialize);
         
         //Do not serialize if...
         if(Type==null || (Type=="Function" && ommitFunctions) || objectName=="prototype" || objectName.indexOf("__")==0 ||  
            (prefixOfTransientMembers!=null && objectName.indexOf(prefixOfTransientMembers)==0)){
         	return ""
         }
         var s = indentSpace  + '<' + objectName +  ' type="' + Type + '">';
         
         switch(Type)
         {
      		case "number":
      		case "boolean":		
      		{
      			s += ObjectToSerialize; 
      		} 
         
      		break;
      	   
      		case "string":
      		{
      			s += "<![CDATA[" + ObjectToSerialize +"]]>"
;
      		}
      		
      		break;

      		case "date":
      	   {
      			s += ObjectToSerialize.toLocaleString(); 
      	   }
      	   break;
      	   
      		case "Array":
      		{
      			s += "\n";
      				
      				for(var name in ObjectToSerialize)
      				{
      					s += JSerialize(ObjectToSerialize[name], ('index' + name ), indentSpace + "   ", ommitFunctions, prefixOfTransientMembers);
      				};
      				
      				s += indentSpace;
      		}
      		break;
         	 		
      		default:
      		{
      			s += "\n";
      			
      			for(var name in ObjectToSerialize)
      			{
                  if(!ObjectToSerialize.hasOwnProperty(name))
                     continue;
      				s += JSerialize(ObjectToSerialize[name], name, indentSpace + "   ", ommitFunctions, prefixOfTransientMembers);
      			};
      			
      			s += indentSpace;
      		}
      		break;
      
         }
         
      	s += "</" + objectName + ">\n";	
           
          return s;
      };
      
      // main entry for deserialization
      // XML string as an input
      function JDeserialize(XmlText)
      {
      	var _doc = XMLUtils.parseFromString(XmlText); 
      	return Deserial(_doc.childNodes[0]);
      }
      
      // internal deserialization
      function Deserial(xn)
      {
      	var RetObj; 
      	 
      	var NodeType = "object";
      	
      	if (xn.attributes != null && xn.attributes.length != 0)
      	{
      		var tmp = xn.attributes.getNamedItem("type");
      		if (tmp != null)
      		{
      			NodeType = xn.attributes.getNamedItem("type").nodeValue;
      		}
      	}
      	
      	if (IsSimpleVar(NodeType))
      	{
      		return StringToObject(xn.textContent, NodeType);
      	}
      	
      	switch(NodeType)
      	{
      		case "NULL":
            {
               return null
            }               
            case "Array":
      		{
      			RetObj = new Array();
      			var arrayIndex = 0
      			for(var i = 0; i < xn.childNodes.length; i++)
      			{
      				var node = xn.childNodes[i];
      				if(node.nodeType!=1){
      					continue
      				}
      				RetObj[arrayIndex++] = Deserial(node);
      			}
      			
      			return RetObj;
      		}
      		
      		case "object":
      		    RetObj = new Object()
      		    break;
      		
      		default:
      		{
               var typeConstructor = getConstructorFromNodeType(NodeType)
      			RetObj = new typeConstructor()
      		}
      		break;
      	}
      	
      	for(var i = 0; i < xn.childNodes.length; i++)
      	{
      		var node = xn.childNodes[i];
      		if(node.nodeType!=1){
      			continue
      		}
      		RetObj[node.nodeName] = Deserial(node);
      	}
      
      	return RetObj;
      }
      
      function getConstructorFromNodeType(type){
         var namespaceParts = type.split(".")
         var constructor = window
         for (var i = 0; i < namespaceParts.length; i++) {
            constructor = constructor[namespaceParts[i]]
            if(constructor==null){
               throw new Error('Class not found exception during deserialzation for type: ' + type)
            }
         }
         if(!(constructor instanceof Function)){
            throw new Error('Class not found exception during deserialzation for type: ' + type)
         }
         return constructor
      }
      
      function IsSimpleVar(type)
      {
      	switch(type)
      	{
      		case "int":
      		case "string":
      		case "String":
      		case "Number":
      		case "number":
      		case "Boolean":
      		case "boolean":
      		case "bool":
      		case "dateTime":
      		case "Date":
      		case "date":
      		case "float":
      			return true;
      	}
      	
      	return false;
      }
      
      function StringToObject(Text, Type)
      {
      	var RetObj = null;
      
      	switch(Type)
      	{
      		case "int":
      			return parseInt(Text);   
      			 
      		case "number":
      		{
      			var outNum;
      			
      			if (Text.indexOf(".") > 0)
      			{
      				return parseFloat(Text);    
      			}
      			else
      			{
      				return parseInt(Text);    
      			}
       		}	
      			 	 
      		case "string":
      		case "String":
      			return Text;
      			 
      		case "dateTime":
      		case "date":
      		case "Date":
      			return new Date(Text);
      		 		
      		case "float":
      			return parseFloat(Text, 10);
      			
      		case "bool":
      		case "boolean":
      			{
      				if (Text == "true" || Text == "True")
      				{
      					return true;
      				}
      				else
      				{
      					return false;
      				}
      			}
      			return parseBool(Text);	
      	}
      
      	return RetObj;  
      }
      
      function GetClassName(obj) 
      {	 
      	try
      	{
      		var ClassName = obj.constructor.toString();
      		ClassName = ClassName.substring(ClassName.indexOf("function") + 8, ClassName.indexOf('(')).replace(/ /g,'');
            if(obj.__namespace)
               ClassName = obj.__namespace + "." + ClassName
      		return ClassName;
      	}
      	catch(e) 
      	{
      		return null;
      	}
      }
       
      function GetTypeName(ObjectToSerialize)
      {
      	if (ObjectToSerialize instanceof Date)
      		return "date";	
      		
      	var Type  = typeof(ObjectToSerialize);
      
      	if (IsSimpleVar(Type))
      	{
      		return Type;
      	}
      	
      	Type = GetClassName(ObjectToSerialize); 
      	
      	return Type;
      }
      
   JSerial = {
   	classes: {},
   	serialize: JSerialize,
   	deserialize: JDeserialize,
   	registerClass: function(key, constructor){
   		this.classes[key] = constructor
   	}
   }
   this["JSerial"] = JSerial;
   
}).apply(this)
}