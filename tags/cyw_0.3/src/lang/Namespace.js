with(this){
/*
 * Version 0.1
 * Created by Rudolf Noé
 * 28.12.2007
 *
 * Basic Namespace functionality
 * Namespaces are emulated via nested objects
 */
(function(){
	var Namespace = {
		VERSION: "0.2",
		//TODO: Remove in future versions if not used any more
		COMMON_NS: "rno_common",
		DEFAULT_COMMON_NS: "rno_common",
		 
		/*
		 * Creates the neccessary ns objects
		 * @param ns: ns string; ns parts are separaded by dot (".")
		 * 		e.g. for "xxx.yyy.zzz" 
		 */
		createNamespace: function(ns, targetWin){
         targetWin = targetWin?targetWin:window
			var names = ns.split('.');
			var obj = targetWin
			for (key in names){
				var name = names[key];
				if(obj[name] == undefined){
					obj[name] = new Object();
				}
				obj = obj[name];
			}
			return obj;
		},
	    
	    /*
	     * Binds an object to a ns
	     * @param ns: ns string e.g. "firstLevelNS.secondLevelNS"
	     * @param name: Name under which the object is bound within the provided ns
	     * 		e.g. ns="firstlevelNS", name="Foo" --> Object will be available via
	     * 		firstlevelNS.Foo
	     * @param object: object which is bound under <ns>.<name> 
	     */
	    bindToNamespace: function(ns, name, object, targetWin){
	    	if(object==null){
	    		throw Error("ns.js: Namespace.bindToNamespace: Param object must not be null");
	    	}
	    	var namespaceObj = this.createNamespace(ns, targetWin);
         namespaceObj[name] = object;
         if(typeof object == "function")
            object.prototype.__namespace = ns
		}
	}
	this["Namespace"] = Namespace;	
}).apply(this)
}