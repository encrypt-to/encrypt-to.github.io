// start audit after page load 
$(document).ready(function () {
		var worker = new Worker('worker.js');
		
		worker.addEventListener('message', function(e) {
	    var data = e.data;
			switch (data.cmd) {
			    case 'audit':
						if (data.valid === 'true') {
				      $('#resultTable > tbody:last').append('<tr><td>' + data.name + '</td><td style="background-color:green;color:white;">=</td><td>' + data.name + '</td><td>' + data.size / 1000 + ' kb</td></tr>');
			      } else {
				      $('#resultTable > tbody:last').append('<tr style="background-color:red;color:white;"><td>' + data.name + '</td><td>!=</td><td>' + data.name + '</td></tr>');
			      }
			      break;
			    case 'commit':
						$('#commit').append("<a href='https://github.com/encrypt-to/encrypt.to/commit/" + data.lastCommit.sha + "'>" + "Last commit from " + data.lastCommit.commit.author.date + ", " + data.lastCommit.commit.message + "</a>");	
			      break;
					case 'done':
						$('#running').text("Test finished.");
						worker.terminate();
						break
					case 'error':
						$('#running').text(data.msg);
						break
			    default:
			      $('#resultTable > tbody:last').append('<tr style="background-color:blue;color:white;"><td>' + data.name + ' unavailable</td><td>!=</td><td>' + data.name + ' unavailable</td></tr>');
			  };
	  }, false);
		
		// start worker
		worker.postMessage({'cmd': 'start'});
});