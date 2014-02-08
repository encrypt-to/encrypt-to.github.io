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
 	self.sourceData = $.ajax({
    	url: self.url + new Date().getTime(),
        async: false
    }).responseText;
};

// encode sourceData to base64
Audit.prototype.encodeData = function() {
	var self = this;	
 	self.encodedData = window.btoa(self.sourceData);
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
 	self.sourceData = $.ajax({
    	url: self.url + new Date().getTime(),
        async: false
    }).responseText;
	self.objects = JSON.parse(self.sourceData);
};

// start audit after page load 
$(document).ready(function () {
    setTimeout(function(){
        
		// load js file list
		var fileLoader = new ObjLoader("https://api.github.com/repos/encrypt-to/encrypt.to/contents/public/assets");

		// load commits
		var commitLoader = new ObjLoader("https://api.github.com/repos/encrypt-to/encrypt.to/commits");
		var lastCommit = commitLoader.objects[0];
		$('#commit').append("<a href='https://github.com/encrypt-to/encrypt.to/commit/" + lastCommit.sha + "'>" + "Last commit from " + lastCommit.commit.author.date + ", " + lastCommit.commit.message + "</a>");		
		
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
					$('#resultTable > tbody:last').append('<tr><td>' + name + '</td><td style="background-color:green;color:white;">=</td><td>' + name + '</td><td>' + size / 1000 + ' kb</td></tr>');		
				} else {
					$('#resultTable > tbody:last').append('<tr style="background-color:red;color:white;"><td>' + name + '</td><td>!=</td><td>' + name + '</td></tr>');
				}		
			}
		}
		$('#running').text("Test finished.");
    }, 500);
});