with (this) {
	/*
	 * Utiltily functions
	 */
	(function() {
		// These two functions must be defined "globally" as they are used in
		// the bind function
		// Taken from firebug, see firebug-license.txt
		function arrayInsert(array, index, other) {
			for (var i = 0; i < other.length; ++i)
				array.splice(i + index, 0, other[i]);
			return array;
		}

		// Taken from firebug, see firebug-license.txt
		function cloneArray(array, fn) {
			var newArray = [];

			if (fn)
				for (var i = 0; i < array.length; ++i)
					newArray.push(fn(array[i]));
			else
				for (var i = 0; i < array.length; ++i)
					newArray.push(array[i]);

			return newArray;
		}

		var Utils = {
			VERSION : "0.2",

			// Taken from firebug, see firebug-license.txt
			bind : function() {
   			var args = cloneArray(arguments), fn = args.shift(), object = args.shift();
				return function() {
					return fn.apply(object, arrayInsert(cloneArray(args), 0, arguments));
				}
			},

			/*
			 * Logs message to Console services @param messageString: string to
			 * log
			 */
			logMessage : function(messageString) {
				var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
						.getService(Components.interfaces.nsIConsoleService);
            var now = new Date();
            messageString = now.getMonth() + '/' + now.getDate() + '/' + now.getYear() + ' ' + 
               now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '   ' + messageString
				consoleService.logStringMessage(messageString);
			},

			/*
			 * Log error to Console services @param error: error-obj to log
			 */
			logError : function(error, message) {
				var errorMessage = message?message+"\n":"";
				for (e in error) {
					errorMessage = errorMessage + e + ": " + error[e] + "\n";
				}
				Components.utils.reportError(errorMessage);
			},

			logDebugMessage : function(messageString, debugPrefId) {
				if (Application.prefs.has(debugPrefId)
						&& Application.prefs.get(debugPrefId).value == true) {
					this.logMessage(messageString)
				}
			},

			/*
			 * Checks whether "object" is instance of the "constructor" @returns
			 * boolean
			 */
			instanceOf : function(object, constructor) {
				while (object != null) {
					if (object == constructor.prototype)
						return true;
					object = object.__proto__;
				}
				return false;
			},

			getInstallLocation : function(chromeUrl) {
            Assert.isTrue(Application.version.substring(0,1)<4, "Utils.getInstallLocation can only be called up to FF version 3.6")
				var extManager = this.getService(
						"@mozilla.org/extensions/manager;1",
						"nsIExtensionManager");
				return extManager.getInstallLocation(chromeUrl).location
			},
         
         getOperationSystem: function(){
            return Components.classes["@mozilla.org/xre/app-info;1"]  
                  .getService(Components.interfaces.nsIXULRuntime).OS
         },

			/*
			 * Returns the service object for the specified component and
			 * interface @param componentName: Name of the component e.g.
			 * "@mozilla.org/consoleservice;1" @param interfaceName: Name of the
			 * interface e.g. "nsIConsoleService" @returns service object
			 */
			getService : function(componentName, interfaceName) {
				return Components.classes[componentName]
						.getService(Components.interfaces[interfaceName]);

			},

			/*
			 * Checks wether a certain extension is installed and enabled @param
			 * guiId: GUI-Id of extension
          * Only up to FF 3.6
			 */
			isExtensionInstalledAndEnabled : function(guiId) {
            Assert.isTrue(Application.version.substring(0,1)<4, "Utils.isExtensionInstalledAndEnabled can only be called up to FF version 3.6")
            //Up to FF 3.6
				if (!Application.extensions.has(guiId)) {
					return false
				}
				var rdfService = this.getService(
						'@mozilla.org/rdf/rdf-service;1', 'nsIRDFService')
				var extensionDatasource = this.getService(
						'@mozilla.org/extensions/manager;1',
						'nsIExtensionManager').datasource

				var ext = rdfService.GetResource("urn:mozilla:item:" + guiId);
				var userDisabled = rdfService
						.GetResource("http://www.mozilla.org/2004/em-rdf#userDisabled");
				var appDisabled = rdfService
						.GetResource("http://www.mozilla.org/2004/em-rdf#appDisabled");

				if (extensionDatasource.hasArcOut(ext, userDisabled, true)
						|| extensionDatasource
								.hasArcOut(ext, appDisabled, true)) {
					return false
				} else {
					return true
				}
			},

			/*
			 * Copies provided string to the clipboard where is it accessible
			 * for paste. It needs a short amount of time until the string is
			 * available in the clipboard @param string: string which is copied
			 * to clipboard
			 */
			copyToClipboard : function(string) {
				var clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
						.getService(Components.interfaces.nsIClipboardHelper);
				clipboardHelper.copyString(string);
			},
         
         /*
          * Creates GUIId via service 
          */
         createGUIId: function(){
            var uuidGenerator =  Components.classes["@mozilla.org/uuid-generator;1"]
               .getService(Components.interfaces.nsIUUIDGenerator);
            return uuidGenerator.generateUUID().toString();
         },

			/*
			 * Registers observerObj for the provided id as an observer @param
			 * observerKey: id for which the observer will be notified @param
			 * observerObj: observer object which implements the
			 * Components.interfaces.nsIObserver inteface
			 */
			registerObserver : function(observerKey, observerObj) {
				var observerService = Components.classes["@mozilla.org/observer-service;1"]
						.getService(Components.interfaces.nsIObserverService);
				observerService.addObserver(observerObj, observerKey, false);
			},

			/*
			 * Creates observer object @param observeFunc: pointer to the
			 * function which is called on notification @returns Observer-object
			 * which implements the Components.interfaces.nsIObserver interface
			 */
			createObserver : function(observeFunc) {
				var observer = new Object();
				observer.QueryInterface = function(iid) {
					if (!iid.equals(Components.interfaces.nsISupports)
							&& !iid
									.equals(Components.interfaces.nsISupportsWeakReference)
							&& !iid.equals(Components.interfaces.nsIObserver)) {
						throw Components.results.NS_ERROR_NO_INTERFACE;
					}
					return this;
				}
				observer.observe = observeFunc
				return observer;
			},

			createObserverForInterface : function(nsIObserver, funcPtr) {
				var observer = {
					QueryInterface : function(iid) {
						if (!iid.equals(Components.interfaces.nsISupports)
								&& !iid
										.equals(Components.interfaces.nsISupportsWeakReference)
								&& !iid
										.equals(Components.interfaces.nsIObserver)) {
							throw Components.results.NS_ERROR_NO_INTERFACE;
						}
						return this;
					},
					observe : function(subject, topic, data) {
                  if(funcPtr){
                     funcPtr.apply(nsIObserver, [subject, topic, data]);
                  }else{
						   nsIObserver.observe(subject, topic, data);
                  }
					}
				}
				return observer;
			},

			/*
			 * Notifies all observers listen to the provided observerId @param
			 * observerId
			 */
			notifyObservers : function(topic, subject, data) {
				var observerService = Components.classes["@mozilla.org/observer-service;1"]
						.getService(Components.interfaces.nsIObserverService);
				observerService.notifyObservers(subject, topic, data);
			},

			/*
			 * Determines nsIUpdateItem for a extension @param: guiId of the
			 * extension @return: nsIUpdateItem
			 */
			getExtension : function(guiId) {
            Assert.isTrue(Application.version.substring(0,1)<4, "Utils.getExtension can only be called up to FF version 3.6")
				var em = Components.classes["@mozilla.org/extensions/manager;1"]
						.getService(Components.interfaces.nsIExtensionManager)
				return em.getItemForID(guiId)
			},

			getMostRecentBrowserWin : function() {
				var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator);
				return wm.getMostRecentWindow("navigator:browser");
			},

			/*
			 * Create URI from string
			 */
			createURI : function(urlString) {
				var ios = Components.classes["@mozilla.org/network/io-service;1"]
						.getService(Components.interfaces.nsIIOService);
				return ios.newURI(urlString, null, null);
			},

			/*
			 * Open Url in new Tab
			 */
			openUrlInNewTab : function(urlString, focus) {
				var uri = this.createURI(urlString)
				var newTab = Application.activeWindow.open(uri);
				if (focus) {
					this.getMostRecentBrowserWin().focus()
					newTab.focus()
				}
				return newTab
			},

			/*
			 * Open Url in new window
			 */
			openInNewWindow : function(urlString, focus) {
				open(urlString)
				if (focus) {
					this.getMostRecentBrowserWin().focus()
				}
			},

			getString : function(stringBundleId, key, replaceParamArray) {
				var stringbundle = document.getElementById(stringBundleId)
				try {
					if (replaceParamArray == null) {
						return stringbundle.getString(key)
					} else {
						return stringbundle.getFormattedString(key,
								replaceParamArray)
					}
				} catch (e) {
               Utils.logError(e)
					return null
				}
			},

			observeObject : function(objectToObserve, propertyToObserve,
					callbackFunction, thisObj) {
				objectToObserve.watch(propertyToObserve, function(prop,
						oldValue, newValue) {
					setTimeout(function() {
						if (thisObj)
							callbackFunction.apply(thisObj, [newValue])
						else
							callbackFunction(newValue)
					})
					return newValue
				})
			},
         
         watchProperty : function(objectToObserve, propertyToObserve, callbackFunction, thisObj) {
            this.observeObject(objectToObserve, propertyToObserve, callbackFunction, thisObj)
         },
         
         unwatchProperty : function(objectToObserve, propertyToObserve){
            objectToObserve.unwatch(propertyToObserve)
         },
         
			/*
			 * Execute the provided funtion after the provided delay being in
			 * that the function is not called another time within the provided
			 * delay
			 */
			executeDelayedTimerMap : new Object(),
			executeDelayed : function(timerId, delay, functionPointer, thisObj, args) {
				this.clearExecuteDelayedTimer(timerId)
				this.executeDelayedTimerMap[timerId] = setTimeout(function() {
               ObjectUtils.callFunction(functionPointer, thisObj, args)
					Utils.executeDelayedTimerMap[timerId] = null
				}, delay)
			},
         
         clearExecuteDelayedTimer: function(timerId){
            if (this.executeDelayedTimerMap[timerId] != null) {
               clearTimeout(this.executeDelayedTimerMap[timerId])
            }
         },

			// Converts a pattern in this programs simple notation to a regular
			// expression.
			// thanks AdBlock!
			// http://www.mozdev.org/source/browse/adblock/adblock/
			//
			convert2RegExp : function(pattern) {
				var s = new String(pattern);
				var res = new String("^");

				for (var i = 0; i < s.length; i++) {
					switch (s[i]) {
						case "*" :
							res += ".*";
							break;

						case "." :
						case "?" :
						case "^" :
						case "$" :
						case "+" :
						case "{" :
						case "[" :
						case "|" :
						case "(" :
						case ")" :
						case "]" :
							res += "\\" + s[i];
							break;

						case "\\" :
							res += "\\\\";
							break;

						case " " :
							// Remove spaces from URLs.
							break;

						default :
							res += s[i];
							break;
					}
				}

				var tldRegExp = new RegExp("^(\\^(?:[^/]*)(?://)?(?:[^/]*))(\\\\\\.tld)((?:/.*)?)$")
				var tldRes = res.match(tldRegExp);
				if (tldRes) {
					// build the mighty TLD RegExp
					var tldStr = "\.(?:demon\\.co\\.uk|esc\\.edu\\.ar|(?:c[oi]\\.)?[^\\.]\\.(?:vt|ne|ks|il|hi|sc|nh|ia|wy|or|ma|vi|tn|in|az|id|nc|co|dc|nd|me|al|ak|de|wv|nm|mo|pr|nj|sd|md|va|ri|ut|ct|pa|ok|ky|mt|ga|la|oh|ms|wi|wa|gu|mi|tx|fl|ca|ar|mn|ny|nv)\\.us|[^\\.]\\.(?:(?:pvt\\.)?k12|cc|tec|lib|state|gen)\\.(?:vt|ne|ks|il|hi|sc|nh|ia|wy|or|ma|vi|tn|in|az|id|nc|co|dc|nd|me|al|ak|de|wv|nm|mo|pr|nj|sd|md|va|ri|ut|ct|pa|ok|ky|mt|ga|la|oh|ms|wi|wa|gu|mi|tx|fl|ca|ar|mn|ny|nv)\\.us|[^\\.]\\.vt|ne|ks|il|hi|sc|nh|ia|wy|or|ma|vi|tn|in|az|id|nc|co|dc|nd|me|al|ak|de|wv|nm|mo|pr|nj|sd|md|va|ri|ut|ct|pa|ok|ky|mt|ga|la|oh|ms|wi|wa|gu|mi|tx|fl|ca|ar|mn|ny|nvus|ne|gg|tr|mm|ki|biz|sj|my|hn|gl|ro|tn|co|br|coop|cy|bo|ck|tc|bv|ke|aero|cs|dm|km|bf|af|mv|ls|tm|jm|pg|ky|ga|pn|sv|mq|hu|za|se|uy|iq|ai|com|ve|na|ba|ph|xxx|no|lv|tf|kz|ma|in|id|si|re|om|by|fi|gs|ir|li|tz|td|cg|pa|am|tv|jo|bi|ee|cd|pk|mn|gd|nz|as|lc|ae|cn|ag|mx|sy|cx|cr|vi|sg|bm|kh|nr|bz|vu|kw|gf|al|uz|eh|int|ht|mw|gm|bg|gu|info|aw|gy|ac|ca|museum|sk|ax|es|kp|bb|sa|et|ie|tl|org|tj|cf|im|mk|de|pro|md|fm|cl|jp|bn|vn|gp|sm|ar|dj|bd|mc|ug|nu|ci|dk|nc|rw|aq|name|st|hm|mo|gq|ps|ge|ao|gr|va|is|mt|gi|la|bh|ms|bt|gb|it|wf|sb|ly|ng|gt|lu|il|pt|mh|eg|kg|pf|um|fr|sr|vg|fj|py|pm|sn|sd|au|sl|gh|us|mr|dz|ye|kn|cm|arpa|bw|lk|mg|tk|su|sc|ru|travel|az|ec|mz|lb|ml|bj|edu|pr|fk|lr|nf|np|do|mp|bs|to|cu|ch|yu|eu|mu|ni|pw|pl|gov|pe|an|ua|uk|gw|tp|kr|je|tt|net|fo|jobs|yt|cc|sh|io|zm|hk|th|so|er|cz|lt|mil|hr|gn|be|qa|cv|vc|tw|ws|ad|sz|at|tg|zw|nl|info\\.tn|org\\.sd|med\\.sd|com\\.hk|org\\.ai|edu\\.sg|at\\.tt|mail\\.pl|net\\.ni|pol\\.dz|hiroshima\\.jp|org\\.bh|edu\\.vu|net\\.im|ernet\\.in|nic\\.tt|com\\.tn|go\\.cr|jersey\\.je|bc\\.ca|com\\.la|go\\.jp|com\\.uy|tourism\\.tn|com\\.ec|conf\\.au|dk\\.org|shizuoka\\.jp|ac\\.vn|matsuyama\\.jp|agro\\.pl|yamaguchi\\.jp|edu\\.vn|yamanashi\\.jp|mil\\.in|sos\\.pl|bj\\.cn|net\\.au|ac\\.ae|psi\\.br|sch\\.ng|org\\.mt|edu\\.ai|edu\\.ck|ac\\.yu|org\\.ws|org\\.ng|rel\\.pl|uk\\.tt|com\\.py|aomori\\.jp|co\\.ug|video\\.hu|net\\.gg|org\\.pk|id\\.au|gov\\.zw|mil\\.tr|net\\.tn|org\\.ly|re\\.kr|mil\\.ye|mil\\.do|com\\.bb|net\\.vi|edu\\.na|co\\.za|asso\\.re|nom\\.pe|edu\\.tw|name\\.et|jl\\.cn|gov\\.ye|ehime\\.jp|miyazaki\\.jp|kanagawa\\.jp|gov\\.au|nm\\.cn|he\\.cn|edu\\.sd|mod\\.om|web\\.ve|edu\\.hk|medecin\\.fr|org\\.cu|info\\.au|edu\\.ve|nx\\.cn|alderney\\.gg|net\\.cu|org\\.za|mb\\.ca|com\\.ye|edu\\.pa|fed\\.us|ac\\.pa|alt\\.na|mil\\.lv|fukuoka\\.jp|gen\\.in|gr\\.jp|gov\\.br|gov\\.ac|id\\.fj|fukui\\.jp|hu\\.com|org\\.gu|net\\.ae|mil\\.ph|ltd\\.je|alt\\.za|gov\\.np|edu\\.jo|net\\.gu|g12\\.br|org\\.tn|store\\.co|fin\\.tn|ac\\.nz|gouv\\.fr|gov\\.il|org\\.ua|org\\.do|org\\.fj|sci\\.eg|gov\\.tt|cci\\.fr|tokyo\\.jp|net\\.lv|gov\\.lc|ind\\.br|ca\\.tt|gos\\.pk|hi\\.cn|net\\.do|co\\.tv|web\\.co|com\\.pa|com\\.ng|ac\\.ma|gov\\.bh|org\\.zw|csiro\\.au|lakas\\.hu|gob\\.ni|gov\\.fk|org\\.sy|gov\\.lb|gov\\.je|ed\\.cr|nb\\.ca|net\\.uy|com\\.ua|media\\.hu|com\\.lb|nom\\.pl|org\\.br|hk\\.cn|co\\.hu|org\\.my|gov\\.dz|sld\\.pa|gob\\.pk|net\\.uk|guernsey\\.gg|nara\\.jp|telememo\\.au|k12\\.tr|org\\.nz|pub\\.sa|edu\\.ac|com\\.dz|edu\\.lv|edu\\.pk|com\\.ph|net\\.na|net\\.et|id\\.lv|au\\.com|ac\\.ng|com\\.my|net\\.cy|unam\\.na|nom\\.za|net\\.np|info\\.pl|priv\\.hu|rec\\.ve|ac\\.uk|edu\\.mm|go\\.ug|ac\\.ug|co\\.dk|net\\.tt|oita\\.jp|fi\\.cr|org\\.ac|aichi\\.jp|org\\.tt|edu\\.bh|us\\.com|ac\\.kr|js\\.cn|edu\\.ni|com\\.mt|fam\\.pk|experts-comptables\\.fr|or\\.kr|org\\.au|web\\.pk|mil\\.jo|biz\\.pl|org\\.np|city\\.hu|org\\.uy|auto\\.pl|aid\\.pl|bib\\.ve|mo\\.cn|br\\.com|dns\\.be|sh\\.cn|org\\.mo|com\\.sg|me\\.uk|gov\\.kw|eun\\.eg|kagoshima\\.jp|ln\\.cn|seoul\\.kr|school\\.fj|com\\.mk|e164\\.arpa|rnu\\.tn|pro\\.ae|org\\.om|gov\\.my|net\\.ye|gov\\.do|co\\.im|org\\.lb|plc\\.co\\.im|net\\.jp|go\\.id|net\\.tw|gov\\.ai|tlf\\.nr|ac\\.im|com\\.do|net\\.py|tozsde\\.hu|com\\.na|tottori\\.jp|net\\.ge|gov\\.cn|org\\.bb|net\\.bs|ac\\.za|rns\\.tn|biz\\.pk|gov\\.ge|org\\.uk|org\\.fk|nhs\\.uk|net\\.bh|tm\\.za|co\\.nz|gov\\.jp|jogasz\\.hu|shop\\.pl|media\\.pl|chiba\\.jp|city\\.za|org\\.ck|net\\.id|com\\.ar|gon\\.pk|gov\\.om|idf\\.il|net\\.cn|prd\\.fr|co\\.in|or\\.ug|red\\.sv|edu\\.lb|k12\\.ec|gx\\.cn|net\\.nz|info\\.hu|ac\\.zw|info\\.tt|com\\.ws|org\\.gg|com\\.et|ac\\.jp|ac\\.at|avocat\\.fr|org\\.ph|sark\\.gg|org\\.ve|tm\\.pl|net\\.pg|gov\\.co|com\\.lc|film\\.hu|ishikawa\\.jp|hotel\\.hu|hl\\.cn|edu\\.ge|com\\.bm|ac\\.om|tec\\.ve|edu\\.tr|cq\\.cn|com\\.pk|firm\\.in|inf\\.br|gunma\\.jp|gov\\.tn|oz\\.au|nf\\.ca|akita\\.jp|net\\.sd|tourism\\.pl|net\\.bb|or\\.at|idv\\.tw|dni\\.us|org\\.mx|conf\\.lv|net\\.jo|nic\\.in|info\\.vn|pe\\.kr|tw\\.cn|org\\.eg|ad\\.jp|hb\\.cn|kyonggi\\.kr|bourse\\.za|org\\.sb|gov\\.gg|net\\.br|mil\\.pe|kobe\\.jp|net\\.sa|edu\\.mt|org\\.vn|yokohama\\.jp|net\\.il|ac\\.cr|edu\\.sb|nagano\\.jp|travel\\.pl|gov\\.tr|com\\.sv|co\\.il|rec\\.br|biz\\.om|com\\.mm|com\\.az|org\\.vu|edu\\.ng|com\\.mx|info\\.co|realestate\\.pl|mil\\.sh|yamagata\\.jp|or\\.id|org\\.ae|greta\\.fr|k12\\.il|com\\.tw|gov\\.ve|arts\\.ve|cul\\.na|gov\\.kh|org\\.bm|etc\\.br|or\\.th|ch\\.vu|de\\.tt|ind\\.je|org\\.tw|nom\\.fr|co\\.tt|net\\.lc|intl\\.tn|shiga\\.jp|pvt\\.ge|gov\\.ua|org\\.pe|net\\.kh|co\\.vi|iwi\\.nz|biz\\.vn|gov\\.ck|edu\\.eg|zj\\.cn|press\\.ma|ac\\.in|eu\\.tt|art\\.do|med\\.ec|bbs\\.tr|gov\\.uk|edu\\.ua|eu\\.com|web\\.do|szex\\.hu|mil\\.kh|gen\\.nz|okinawa\\.jp|mob\\.nr|edu\\.ws|edu\\.sv|xj\\.cn|net\\.ru|dk\\.tt|erotika\\.hu|com\\.sh|cn\\.com|edu\\.pl|com\\.nc|org\\.il|arts\\.co|chirurgiens-dentistes\\.fr|net\\.pa|takamatsu\\.jp|net\\.ng|org\\.hu|net\\.in|net\\.vu|gen\\.tr|shop\\.hu|com\\.ae|tokushima\\.jp|za\\.com|gov\\.eg|co\\.jp|uba\\.ar|net\\.my|biz\\.et|art\\.br|ac\\.fk|gob\\.pe|com\\.bs|co\\.ae|de\\.net|net\\.eg|hyogo\\.jp|edunet\\.tn|museum\\.om|nom\\.ve|rnrt\\.tn|hn\\.cn|com\\.fk|edu\\.dz|ne\\.kr|co\\.je|sch\\.uk|priv\\.pl|sp\\.br|net\\.hk|name\\.vn|com\\.sa|edu\\.bm|qc\\.ca|bolt\\.hu|per\\.kh|sn\\.cn|mil\\.id|kagawa\\.jp|utsunomiya\\.jp|erotica\\.hu|gd\\.cn|net\\.tr|edu\\.np|asn\\.au|com\\.gu|ind\\.tn|mil\\.br|net\\.lb|nom\\.co|org\\.la|mil\\.pl|ac\\.il|gov\\.jo|com\\.kw|edu\\.sh|otc\\.au|gmina\\.pl|per\\.sg|gov\\.mo|int\\.ve|news\\.hu|sec\\.ps|ac\\.pg|health\\.vn|sex\\.pl|net\\.nc|qc\\.com|idv\\.hk|org\\.hk|gok\\.pk|com\\.ac|tochigi\\.jp|gsm\\.pl|law\\.za|pro\\.vn|edu\\.pe|info\\.et|sch\\.gg|com\\.vn|gov\\.bm|com\\.cn|mod\\.uk|gov\\.ps|toyama\\.jp|gv\\.at|yk\\.ca|org\\.et|suli\\.hu|edu\\.my|org\\.mm|co\\.yu|int\\.ar|pe\\.ca|tm\\.hu|net\\.sb|org\\.yu|com\\.ru|com\\.pe|edu\\.kh|edu\\.kw|org\\.qa|med\\.om|net\\.ws|org\\.in|turystyka\\.pl|store\\.ve|org\\.bs|mil\\.uy|net\\.ar|iwate\\.jp|org\\.nc|us\\.tt|gov\\.sh|nom\\.fk|go\\.th|gov\\.ec|com\\.br|edu\\.do|gov\\.ng|pro\\.tt|sapporo\\.jp|net\\.ua|tm\\.fr|com\\.lv|com\\.mo|edu\\.uk|fin\\.ec|edu\\.ps|ru\\.com|edu\\.ec|ac\\.fj|net\\.mm|veterinaire\\.fr|nom\\.re|ingatlan\\.hu|fr\\.vu|ne\\.jp|int\\.co|gov\\.cy|org\\.lv|de\\.com|nagasaki\\.jp|com\\.sb|gov\\.za|org\\.lc|com\\.fj|ind\\.in|or\\.cr|sc\\.cn|chambagri\\.fr|or\\.jp|forum\\.hu|tmp\\.br|reklam\\.hu|gob\\.sv|com\\.pl|saitama\\.jp|name\\.tt|niigata\\.jp|sklep\\.pl|nom\\.ni|co\\.ma|net\\.la|co\\.om|pharmacien\\.fr|port\\.fr|mil\\.gu|au\\.tt|edu\\.gu|ngo\\.ph|com\\.ve|ac\\.th|gov\\.fj|barreau\\.fr|net\\.ac|ac\\.je|org\\.kw|sport\\.hu|ac\\.cn|net\\.bm|ibaraki\\.jp|tel\\.no|org\\.cy|edu\\.mo|gb\\.net|kyoto\\.jp|sch\\.sa|com\\.au|edu\\.lc|fax\\.nr|gov\\.mm|it\\.tt|org\\.jo|nat\\.tn|mil\\.ve|be\\.tt|org\\.az|rec\\.co|co\\.ve|gifu\\.jp|net\\.th|hokkaido\\.jp|ac\\.gg|go\\.kr|edu\\.ye|qh\\.cn|ab\\.ca|org\\.cn|no\\.com|co\\.uk|gov\\.gu|de\\.vu|miasta\\.pl|kawasaki\\.jp|co\\.cr|miyagi\\.jp|org\\.jp|osaka\\.jp|web\\.za|net\\.za|gov\\.pk|gov\\.vn|agrar\\.hu|asn\\.lv|org\\.sv|net\\.sh|org\\.sa|org\\.dz|assedic\\.fr|com\\.sy|net\\.ph|mil\\.ge|es\\.tt|mobile\\.nr|co\\.kr|ltd\\.uk|ac\\.be|fgov\\.be|geek\\.nz|ind\\.gg|net\\.mt|maori\\.nz|ens\\.tn|edu\\.py|gov\\.sd|gov\\.qa|nt\\.ca|com\\.pg|org\\.kh|pc\\.pl|com\\.eg|net\\.ly|se\\.com|gb\\.com|edu\\.ar|sch\\.je|mil\\.ac|mil\\.ar|okayama\\.jp|gov\\.sg|ac\\.id|co\\.id|com\\.ly|huissier-justice\\.fr|nic\\.im|gov\\.lv|nu\\.ca|org\\.sg|com\\.kh|org\\.vi|sa\\.cr|lg\\.jp|ns\\.ca|edu\\.co|gov\\.im|edu\\.om|net\\.dz|org\\.pl|pp\\.ru|tm\\.mt|org\\.ar|co\\.gg|org\\.im|edu\\.qa|org\\.py|edu\\.uy|targi\\.pl|com\\.ge|gub\\.uy|gov\\.ar|ltd\\.gg|fr\\.tt|net\\.qa|com\\.np|ass\\.dz|se\\.tt|com\\.ai|org\\.ma|plo\\.ps|co\\.at|med\\.sa|net\\.sg|kanazawa\\.jp|com\\.fr|school\\.za|net\\.pl|ngo\\.za|net\\.sy|ed\\.jp|org\\.na|net\\.ma|asso\\.fr|police\\.uk|powiat\\.pl|govt\\.nz|sk\\.ca|tj\\.cn|mil\\.ec|com\\.jo|net\\.mo|notaires\\.fr|avoues\\.fr|aeroport\\.fr|yn\\.cn|gov\\.et|gov\\.sa|gov\\.ae|com\\.tt|art\\.dz|firm\\.ve|com\\.sd|school\\.nz|edu\\.et|gob\\.pa|telecom\\.na|ac\\.cy|gz\\.cn|net\\.kw|mobil\\.nr|nic\\.uk|co\\.th|com\\.vu|com\\.re|belgie\\.be|nl\\.ca|uk\\.com|com\\.om|utazas\\.hu|presse\\.fr|co\\.ck|xz\\.cn|org\\.tr|mil\\.co|edu\\.cn|net\\.ec|on\\.ca|konyvelo\\.hu|gop\\.pk|net\\.om|info\\.ve|com\\.ni|sa\\.com|com\\.tr|sch\\.sd|fukushima\\.jp|tel\\.nr|atm\\.pl|kitakyushu\\.jp|com\\.qa|firm\\.co|edu\\.tt|games\\.hu|mil\\.nz|cri\\.nz|net\\.az|org\\.ge|mie\\.jp|net\\.mx|sch\\.ae|nieruchomosci\\.pl|int\\.vn|edu\\.za|com\\.cy|wakayama\\.jp|gov\\.hk|org\\.pa|edu\\.au|gov\\.in|pro\\.om|2000\\.hu|szkola\\.pl|shimane\\.jp|co\\.zw|gove\\.tw|com\\.co|net\\.ck|net\\.pk|net\\.ve|org\\.ru|uk\\.net|org\\.co|uu\\.mt|com\\.cu|mil\\.za|plc\\.uk|lkd\\.co\\.im|gs\\.cn|sex\\.hu|net\\.je|kumamoto\\.jp|mil\\.lb|edu\\.yu|gov\\.ws|sendai\\.jp|eu\\.org|ah\\.cn|net\\.vn|gov\\.sb|net\\.pe|nagoya\\.jp|geometre-expert\\.fr|net\\.fk|biz\\.tt|org\\.sh|edu\\.sa|saga\\.jp|sx\\.cn|org\\.je|org\\.ye|muni\\.il|kochi\\.jp|com\\.bh|org\\.ec|priv\\.at|gov\\.sy|org\\.ni|casino\\.hu|res\\.in|uy\\.com)"

					// insert it
					res = tldRes[1] + tldStr + tldRes[3];
				}
				return new RegExp(res + "$", "i");
			},

			stopEvent : function(event) {
				event.stopPropagation()
				event.preventDefault()
			},
         
         /*
          * Retrieve an JS property according to the provided string. 
          * The property could be a nested in which case the differnt parts must 
          * be seperated with dots ('.').
          * E.g.: srcObj = window, propertyId=xyz.abc then the object window[xyz][abc] would be given back
          * @param: Object srcObj: The object from which the property should given back
          * @param: String propertyId: name or path of the property 
          */
         getNestedProperty: function(srcObj, propertyId){
            var parts = propertyId.split(".")
            var result = srcObj
            for (var i = 0; i < parts.length; i++) {
               result = result[parts[i]]
               if(i < parts.length-1){
                  Assert.notNull(result, parts[i] + " does not exists in srcObj or nested object. SrcObj: " + srcObj + " propertyId: " + propertyId)
               }
            }
            return result
         }

		}

		this["Utils"] = Utils;

      OperationSystem = {
         WINDOWS: "WINNT",
         LINUX: "Linux",
         MAC_OS_X: "Darwin"
      }
		this["OperationSystem"] = OperationSystem;
      
	}).apply(this)

}