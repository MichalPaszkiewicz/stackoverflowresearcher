var fs = require("fs");

var questions = [];
var person = function(){
	return document.getElementById("name").value;
}

var showHidden = false;

var site = function(){
	return document.getElementById("site").value;
}

var search = function(){
	return document.getElementById("search").value;
}

function addQuestion(link, title, creationDate, site){
	for(var i = 0; i < questions.length; i++){
		if(questions[i].title == title){
			return;
		}
	}
	questions.push({link: link, title: title, creationDate: creationDate, checked: false, isBad: false, isGood: false, site: site});
}

function addCustomSite(){
	var link = document.getElementById('link').value;
	var title = document.getElementById('title').value;
	
	document.getElementById('link').value = "";
	document.getElementById('title').value = "";
	
	var time = (new Date()).getTime();
	questions.push({link: link, title: title, creationDate: time, checked: true, isBad: false, isGood: false});
	
	printQuestions();
}

function checkQuestion(link){
	for(var i = 0; i < questions.length; i++){
		if(questions[i].link == link){
			questions[i].checked = true;
		}
	}
	
	printQuestions();
}

function setBadQuestion(link){
	for(var i = 0; i < questions.length; i++){
		if(questions[i].link == link){
			questions[i].isBad = true;
		}
	}

	printQuestions();
}

function toggleGoodQuestion(link){
	for(var i = 0; i < questions.length; i++){
		if(questions[i].link == link){
			questions[i].isBad = false;
			questions[i].isGood = !questions[i].isGood;
		}
	}
	
	printQuestions();
}

function getResearchFile(){
	fs.readFile(person() + ".txt", "utf-8", function(err, data){
		if(err){
			printQuestions();
			return;
		}
		
		var questionData = JSON.parse(data);
		
		questions = questionData;
		printQuestions();
	});
}

function getData(){
	questions = [];
	
	getResearchFile();
}

function writeResearchFile(){
	var questionString = JSON.stringify(questions);
	
	fs.writeFile(person() + ".txt", questionString);
}

function toggleHidden(){
	showHidden = !showHidden;
	
	if(showHidden == true){
		document.getElementById("toggle-hidden").innerText = "hide bad";
	}
	else{
		document.getElementById("toggle-hidden").innerText = "show bad";
	}
	
	printQuestions();
}

String.prototype.insertText = function( idx, text ) {
    return (this.slice(0,idx) + s + this.slice(idx + 0));
};

function printQuestions(){
	var resultDiv = document.getElementById("results");
	
	resultDiv.innerHTML = "";
	
	var num = 0;
	var pos = 0;
	var read = 0;
	var bad = 0;
	
	var searchText = search().trim();
	
	var searchWords = searchText.split(" ");
	
	searchWords.sort(function(a, b){ return b.length - a.length });
	
	var filteredQuestions = [];
	
	for(var i = 0; i < questions.length; i++){
		var qp = questions[i];
		
		var q = {link: qp.link, title: qp.title, creationDate: qp.creationDate, checked: qp.checked, isBad: qp.isBad, isGood: qp.isGood, site: qp.site};
		
		if(searchText == ""){
			filteredQuestions.push(q);
		}
		else{
			for(var j = 0; j < searchWords.length; j++){				
				if(q.title.replace(/&quot;/g,"'").replace(/&#39;/g, "'").toLowerCase().indexOf(searchWords[j].toLowerCase()) != -1){
					filteredQuestions.push(q);
					break;
				}
			}
		}
	};
	
	filteredQuestions.sort(function(a, b){
		
		var aCount = 0;
		var bCount = 0;
		
		for(var i = 0; i < searchWords.length; i++){
			if(a.title.replace(/&quot;/g,"'").replace(/&#39;/g, "'").toLowerCase().indexOf(searchWords[i].toLowerCase()) != -1){
				aCount++;
			}
			if(b.title.replace(/&quot;/g,"'").replace(/&#39;/g, "'").toLowerCase().indexOf(searchWords[i].toLowerCase()) != -1){
				bCount++;
			}
		}
		
		return bCount - aCount;
	});
	
	for(var i = 0; i < filteredQuestions.length; i++){
		var q = filteredQuestions[i];
		
		for(var j = 0; j < searchWords.length; j++){
			
			if(q.title.toLowerCase().indexOf(searchWords[j].toLowerCase()) != -1){
				
				// lower case title
				var lt = q.title.toLowerCase();
				
				// index of place
				var ind = lt.indexOf(searchWords[j].toLowerCase());
				
				// length of searchtext
				var ls = searchWords[j].length;
				
				// substring needed
				var actualText = q.title.substr(ind, ls);
				
				q.title = q.title.replace(actualText, "<span style='color: orange'>" + actualText + "</span>")
			}
		}
	}
	
	for(var i = 0; i < filteredQuestions.length; i++){
		if(filteredQuestions[i].isBad && showHidden == false){
			continue;
		}
					
		var qChecked = filteredQuestions[i].checked;
		var questionDiv = document.createElement("div");
		if(qChecked){
			questionDiv.style.background = "darkgreen";
			read++;
		}
		if(filteredQuestions[i].isBad == true){
			questionDiv.style.background = "darkred";
			bad++;
		}
		if(filteredQuestions[i].isGood == true){
			questionDiv.style.background = "rgb(31, 165, 58)";
			pos++;
		}
		questionDiv.className = "link";
			var tick = document.createElement("input");
			tick.type = "checkbox";
			tick.checked = qChecked;
			tick.disabled = true;
			questionDiv.appendChild(tick);
			var a = document.createElement("span");
			a.setAttribute("data-link", filteredQuestions[i].link);
			a.innerHTML = filteredQuestions[i].title.replace(/&quot;/g,"'").replace(/&#39;/g, "'") + "<span class='site-tag'>" + filteredQuestions[i].site + "</span>";
			a.onclick = function(e) {			 
				var dataLink = e.target.attributes["data-link"];
				checkQuestion(dataLink.value);
				require('shell').openExternal(dataLink.value);
				return false;
			};
			questionDiv.appendChild(a);
			var v = document.createElement("div");
			v.className = "button positive";
			v.innerText = "v";
			v.setAttribute("data-link", filteredQuestions[i].link);
			v.onclick = function(e){
				var dataLink = e.target.attributes["data-link"];
				toggleGoodQuestion(dataLink.value);
			}
			questionDiv.appendChild(v);
			var x = document.createElement("div");
			x.className = "button";
			x.innerText = "x";
			x.setAttribute("data-link", filteredQuestions[i].link);
			x.onclick = function(e){
				var dataLink = e.target.attributes["data-link"];
				//if(confirm("Is this article truly that bad?") == true){
					setBadQuestion(dataLink.value);
				//}
			}
			questionDiv.appendChild(x);

		
		resultDiv.appendChild(questionDiv);
		
		num++;
	}
	
	var resultText = num + " items on page <span class='read'>" + read + " items read</span> <span class='positive'>" + pos + " amazing items</span>";
	
	if(showHidden == true){
		resultText += " <span class='bad'>" + bad + " terrible items</span>";
	}
	
	document.getElementById("result-text").innerHTML = resultText;
}

function callApi(site){
	var callString = "https://api.stackexchange.com/2.2/search/advanced?q=" + person() + "&sort=creation&site=" + site;

	var request = new XMLHttpRequest();
	
	request.onload = function(d, e){
		var dataText = request.response;
		var data = JSON.parse(dataText);
		
		for(var i = 0; i < data.items.length; i++){
			var link = data.items[i].link;
			var title = data.items[i].title;
			var creationDate = data.items[i].creation_date;
			addQuestion(link, title, creationDate, site);
		}
		
		printQuestions();
	}
	
	request.open("GET", callString,true);
	
	request.send();
}

function callSpecificApi(){
	callApi(site());
}

function callApis(){
	var apis = ["hsm","stackoverflow","mathoverflow","math","physics","philosophy","engineering"];
	
	if(confirm("Are you sure you want to do " + apis.length + " API calls?") == true){
		for(var i = 0; i < apis.length; i++){
			callApi(apis[i]);
		}
	}
}