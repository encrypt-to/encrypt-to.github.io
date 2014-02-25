function startAudit() {
	// load js file list
	var fileLoader = new ObjLoader("https://api.github.com/repos/encrypt-to/encrypt.to/contents/public/assets");

	// load commits
	var commitLoader = new ObjLoader("https://api.github.com/repos/encrypt-to/encrypt.to/commits");
	var lastCommit = commitLoader.objects[0];	
	
	if (lastCommit) {
		self.postMessage({'cmd':'commit','lastCommit':lastCommit});
	} else {
		self.postMessage({'cmd':'error','msg':'Can not load files from Github.'});
		//self.close();
	}
	
	// start file audit
	for (var i in fileLoader.objects) {
		var name = fileLoader.objects[i].name;
		var size = fileLoader.objects[i].size;
		if (name.indexOf(".js") !== -1) {

			// build links
			var deployedLink = 'https://encrypt.to/assets/' + name;
			var githubLink = 'https://api.github.com/repos/encrypt-to/encrypt.to/contents/public/assets/' + name;
		
			// load files
			var deployed = new Audit(deployedLink, false);
			var github = new Audit(githubLink, true);	

			// compare base64 string
			var result = deployed.encodedData === github.encodedData;

			// write result
			if (result) {
				self.postMessage({'cmd':'audit','valid':'true','name':name,'size':size});
			} else {
				self.postMessage({'cmd':'audit','valid':'false','name':name,'size':size});
			}		
		}
	}
	
	// worker done
	self.postMessage({'cmd':'done'});
	
}

/**
 * Audit Security Tool for Encrypt.to
 * The script compares js files from github and the deployed version at Encrypt.to.
 *
 */

// define audit class
function Audit(url, isJson) {
	var self = this;
	self.isJson = isJson;
	self.url = url;
	
	self.startAudit();
}

// start processing
Audit.prototype.startAudit = function() {
	var self = this;
	self.loadData();
	self.encodeData();
	
	if (self.isJson) {
		self.parseJson();
		self.cleanupString();
	}
};

// fetch data from remote source
Audit.prototype.loadData = function() {
	var self = this;
	var req = new XMLHttpRequest();
	req.open('GET', self.url + "?" + new Date().getTime(), false); 
	req.send(null);
	if(req.status == 200) {
		self.sourceData = req.responseText;
	} else {
		//self.postMessage({'cmd':'error','req':req});
	}
};

// encode sourceData to base64
Audit.prototype.encodeData = function() {
	var self = this;	
	importScripts("base64.js");
 	self.encodedData = base64.encode(self.sourceData);
};

// load encoded data from obj
Audit.prototype.parseJson = function() {
	var self = this;
 	var obj = JSON.parse(self.sourceData);
	self.encodedData = obj.content;
};

// remove newlines
Audit.prototype.cleanupString = function() {
	var self = this;
	self.encodedData = self.encodedData.replace(/\n/g,'');
};

// define ObjLoader class
function ObjLoader(url) {
	var self = this;
	self.url = url;
	self.objects = [];
	self.loadData();
}

// fetch data from remote source
ObjLoader.prototype.loadData = function() {
	var self = this;
	var req = new XMLHttpRequest();
	req.open('GET', self.url + "?" + new Date().getTime(), false); 
	req.send(null);
	if(req.status == 200) {
		self.sourceData = req.responseText;
		self.objects = JSON.parse(self.sourceData);
	} else {
		//self.postMessage({'cmd':'error','req':req});
	}
};

// web worker 
self.addEventListener('message', function(e) {
  startAudit();
}, false);