with(this){
(function(){
	var Firefox = {
		//Returns the currently active tab
		getActiveBrowser: function(win){
			if(!window)
			   win = window
			return window.getBrowser().selectedBrowser
		}
	}

	this.Firefox = Firefox;
}).apply(this)
}