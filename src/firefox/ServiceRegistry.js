with(this){
(function(){
   const CC = Components.classes;
   const CI = Components.interfaces;
   
   var ServiceRegistry = {
      
      getAddonManager: function(){
         Components.utils.import("resource://gre/modules/AddonManager.jsm");
         return AddonManager;
      },
      
      getVersionComparator: function(){
         return CC["@mozilla.org/xpcom/version-comparator;1"].getService(CI.nsIVersionComparator);
      }
      
   }

   this.ServiceRegistry = ServiceRegistry;
}).apply(this)
}