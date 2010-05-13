with(this){
(function(){
   /////////////////////////////////////////////////
   // Basic file IO object based on Mozilla source 
   // code post at forums.mozillazine.org
   /////////////////////////////////////////////////

   // Example use:
   // var fileIn = FileIO.open('/test.txt');
   // if (fileIn.exists()) {
   //    var fileOut = FileIO.open('/copy of test.txt');
   //    var str = FileIO.read(fileIn);
   //    var rv = FileIO.write(fileOut, str);
   //    alert('File write: ' + rv);
   //    rv = FileIO.write(fileOut, str, 'a');
   //    alert('File append: ' + rv);
   //    rv = FileIO.unlink(fileOut);
   //    alert('File unlink: ' + rv);
   // }

   var FileIO = {
      VERSION: "0.2",
      localfileCID  : '@mozilla.org/file/local;1',
      localfileIID  : Components.interfaces.nsILocalFile,

      finstreamCID  : '@mozilla.org/network/file-input-stream;1',
      finstreamIID  : Components.interfaces.nsIFileInputStream,

      foutstreamCID : '@mozilla.org/network/file-output-stream;1',
      foutstreamIID : Components.interfaces.nsIFileOutputStream,

      foutstreamconvCID: "@mozilla.org/intl/converter-output-stream;1",
      foutstreamconvIID: Components.interfaces.nsIConverterOutputStream,

      sinstreamCID  : '@mozilla.org/scriptableinputstream;1',
      sinstreamIID  : Components.interfaces.nsIScriptableInputStream,

      suniconvCID   : '@mozilla.org/intl/scriptableunicodeconverter',
      suniconvIID   : Components.interfaces.nsIScriptableUnicodeConverter,
      

      chromeRegistryService : Components.classes["@mozilla.org/chrome/chrome-registry;1"].
                     getService(Components.interfaces.nsIChromeRegistry),
      ioService : Components.classes["@mozilla.org/network/io-service;1"].
                     getService(Components.interfaces.nsIIOService),

      
      /*
       * Converts chrome path to common local nsiUri 
       */
      convertChromeUrlToUri: function(chromeUrl){
         var chromeUri = this.ioService.newURI(chromeUrl, null, null)
         return this.chromeRegistryService.convertChromeURL(chromeUri)
      },
      
      open   : function(path) {
         var file = Components.classes[this.localfileCID]
                     .createInstance(this.localfileIID);
         file.initWithPath(path);
         return file;
      },
      
      openFromChrome: function(chromePath){
         Assert.notNull(chromePath)
         var chromeFullUri = this.convertChromeUrlToUri(chromePath)
         return chromeFullUri.QueryInterface(Components.interfaces.nsIFileURL).file; 
      },

      read   : function(file, charset) {
         
         var fiStream = Components.classes[this.finstreamCID]
                        .createInstance(this.finstreamIID);
         fiStream.init(file, 1, 0, false);
         
         const replacementChar = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
         var ciStream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                            .createInstance(Components.interfaces.nsIConverterInputStream);
         ciStream.init(fiStream, charset, 1024, replacementChar);

         var data = "";
         var temp = {}
         while (ciStream.readString(4096, temp) != 0) {
            data += temp.value;
         }

         ciStream.close()
         fiStream.close();

         return data;
      },
      
      /*
       * Read content of file
       * @param chromePaht: chrome url of file
       * @param charset: charset like "UTF-8"
       */
      readFromChrome: function(chromePath, charset){
         return this.read(this.openFromChrome(chromePath), charset)
      },

      /**
       * Writes string data to local file
       * @param nsIFile file: Defines the target
       * @param String data: String to write to the file
       * @param mode
       * @param String charset: Charset like "UTF-8" in which data will be written to disk  
       */
      write  : function(file, data, mode, charset) {
         var foStream = Components.classes[this.foutstreamCID]
                        .createInstance(this.foutstreamIID);
         var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
         if (mode == 'a') {
            flags = 0x02 | 0x10; // wronly | append
         }
         foStream.init(file, flags, 0664, 0);
         
         var converterOS = Components.classes[this.foutstreamconvCID]
                            .createInstance(this.foutstreamconvIID);
         
         converterOS.init(foStream, charset, 4096, 0x0000);
         converterOS.writeString(data);
         converterOS.close()
         foStream.close();
         
         return true;
      },

      create : function(file) {
         file.create(0x00, 0664);
      },

      remove : function(file) {
         file.remove(false);
      },

      path   : function(file) {
         return 'file:///' + file.path.replace(/\\/g, '\/')
                  .replace(/^\s*\/?/, '').replace(/\ /g, '%20');
      },

      toUnicode   : function(charset, data) {
         var uniConv = Components.classes[this.suniconvCID]
                        .createInstance(this.suniconvIID);
         uniConv.charset = charset;
         data = uniConv.ConvertToUnicode(data);
         return data;
      },

      fromUnicode : function(charset, data) {
         var uniConv = Components.classes[this.suniconvCID]
                        .createInstance(this.suniconvIID);
         uniConv.charset = charset;
         data = uniConv.ConvertFromUnicode(data);
         // data += uniConv.Finish();
         return data;
      },
      
      getWriteStream: function(file) {
         var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
             .createInstance(Components.interfaces.nsIFileOutputStream);
              stream.init(file, 0x02 | 0x08 | 0x20, 420, -1);
         return stream;
      }

   }


   /////////////////////////////////////////////////
   // Basic Directory IO object based on JSLib 
   // source code found at jslib.mozdev.org
   /////////////////////////////////////////////////

   // Example use:
   // var dir = DirIO.open('/test');
   // if (dir.exists()) {
   //    alert(DirIO.path(dir));
   //    var arr = DirIO.read(dir, true), i;
   //    if (arr) {
   //       for (i = 0; i < arr.length; ++i) {
   //          alert(arr[i].path);
   //       }
   //    }
   // }
   // else {
   //    var rv = DirIO.create(dir);
   //    alert('Directory create: ' + rv);
   // }

   // ---------------------------------------------
   // ----------------- Nota Bene -----------------
   // ---------------------------------------------
   // Some possible types for get are:
   //    'ProfD'           = profile
   //    'DefProfRt'       = user (e.g., /root/.mozilla)
   //    'UChrm'           = %profile%/chrome
   //    'DefRt'           = installation
   //    'PrfDef'          = %installation%/defaults/pref
   //    'ProfDefNoLoc'    = %installation%/defaults/profile
   //    'APlugns'         = %installation%/plugins
   //    'AChrom'          = %installation%/chrome
   //    'ComsD'           = %installation%/components
   //    'CurProcD'        = installation (usually)
   //    'Home'            = OS root (e.g., /root)
   //    'TmpD'            = OS tmp (e.g., /tmp)

   var DirIO = {

      sep        : '/',

      dirservCID : '@mozilla.org/file/directory_service;1',
   
      propsIID   : Components.interfaces.nsIProperties,
   
      fileIID    : Components.interfaces.nsIFile,

      /*
       * retruns nsIFile
       */
      get    : function(type) {
         var dir = Components.classes[this.dirservCID]
                     .createInstance(this.propsIID)
                     .get(type, this.fileIID);
         return dir;
      },
      
      //returns: nsIFile of current profile dir
      getProfileDir: function(){
         return this.get("ProfD")
      },
      
      open   : function(path) {
         return FileIO.open(path);
      },
      
      create : function(dir) {
			dir.create(0x01, 0755);
         return true;
      },

      read   : function(dir, recursive) {
         var list = new Array();
         if (dir.isDirectory()) {
            if (recursive == null) {
               recursive = false;
            }
            var files = dir.directoryEntries;
            list = this._read(files, recursive);
         }
         return list;
      },

      _read  : function(dirEntry, recursive) {
         var list = new Array();
         while (dirEntry.hasMoreElements()) {
            list.push(dirEntry.getNext()
                        .QueryInterface(FileIO.localfileIID));
         }
         if (recursive) {
            var list2 = new Array();
            for (var i = 0; i < list.length; ++i) {
               if (list[i].isDirectory()) {
                  files = list[i].directoryEntries;
                  list2 = this._read(files, recursive);
               }
            }
            for (i = 0; i < list2.length; ++i) {
               list.push(list2[i]);
            }
         }
         return list;
      },

      unlink : function(dir, recursive) {
         if (recursive == null) {
            recursive = false;
         }
         dir.remove(recursive);
         return true;
      },

      path   : function (dir) {
         return FileIO.path(dir);
      },

      split  : function(str, join) {
         var arr = str.split(/\/|\\/), i;
         str = new String();
         for (i = 0; i < arr.length; ++i) {
            str += arr[i] + ((i != arr.length - 1) ? 
                              join : '');
         }
         return str;
      },

      join   : function(str, split) {
         var arr = str.split(split), i;
         str = new String();
         for (i = 0; i < arr.length; ++i) {
            str += arr[i] + ((i != arr.length - 1) ? 
                              this.sep : '');
         }
         return str;
      }
   
   }

   if (navigator.platform.toLowerCase().indexOf('win') > -1) {
      DirIO.sep = '\\';
   }

   this["FileIO"] = FileIO;
   this["DirIO"] = DirIO;
}).apply(this);
}