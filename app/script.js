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

function addQuestion(link, title, creationDate, site, questionID, body){
	for(var i = 0; i < questions.length; i++){
		if(questions[i].title == title){
			return;
		}
	}
	questions.push({link: link, title: title, creationDate: creationDate, checked: false, isBad: false, isGood: false, site: site, questionID: questionID, body: body});
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

function openQuestion(questionID){
	
	for(var  i = 0; i < questions.length; i++){
		if(questions[i].questionID == questionID){
			var theQ = questions[i];
			
			document.getElementById("detail-question").innerHTML = theQ.body;
			document.getElementById("detail-answer").innerHTML = theQ.answer;
			
			document.getElementById("detail").className = document.getElementById("detail").className.replace(/hidden/g, "");
		
		}
	}
	
}

function closeDetail(){
	document.getElementById("detail").className += " hidden";
}

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
		
		var q = {link: qp.link, title: qp.title, creationDate: qp.creationDate, checked: qp.checked, isBad: qp.isBad, isGood: qp.isGood, site: qp.site, questionID: qp.questionID, answer: qp.answer};
		
		if(searchText == ""){
			filteredQuestions.push(q);
		}
		else{
			for(var j = 0; j < searchWords.length; j++){		
				if(searchWords[j].toLowerCase().indexOf("tag:") != -1){
					var itemTag = searchWords[j].substr(4);
					
					if(itemTag == q.site){
						filteredQuestions.push(q);
						break;
					}
					else{
						break;
					}
				}
				
				if(q.title.replace(/&quot;/g,"'").replace(/&#39;/g, "'").toLowerCase().indexOf(searchWords[j].toLowerCase()) != -1){
					filteredQuestions.push(q);
					break;
				}
				else if(searchWords[j].toLowerCase() == q.site){
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
			
			if(q.title.replace(/&quot;/g,"'").replace(/&#39;/g, "'").toLowerCase().indexOf(searchWords[j].toLowerCase()) != -1){
				
				// lower case title
				var lt = q.title.replace(/&quot;/g,"'").replace(/&#39;/g, "'").toLowerCase();
				
				// index of place
				var ind = lt.indexOf(searchWords[j].toLowerCase());
				
				// length of searchtext
				var ls = searchWords[j].length;
				
				// substring needed
				var actualText = q.title.replace(/&quot;/g,"'").replace(/&#39;/g, "'").substr(ind, ls);
				
				q.title = q.title.replace(/&quot;/g,"'").replace(/&#39;/g, "'").replace(actualText, "<span style='color: orange'>" + actualText + "</span>")
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
			
			var aHtml = filteredQuestions[i].title.replace(/&quot;/g,"'").replace(/&#39;/g, "'");
			aHtml += "<span class='site-tag'>" + filteredQuestions[i].site + "</span>";

			a.innerHTML = aHtml;
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
			if(filteredQuestions[i].answer != undefined){
				var answer = document.createElement("div");
				answer.className = "button answer";
				answer.innerText = "a";
				answer.setAttribute("data-question", filteredQuestions[i].questionID);
				answer.onclick = function(e){
					var dataQuestion = e.target.attributes["data-question"];
					openQuestion(dataQuestion.value);
					window.location = "#detail";
				}
				
				questionDiv.appendChild(answer);
			}

		
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
	var callString = "https://api.stackexchange.com/2.2/search/advanced?pagesize=90&q=" + person() + "&sort=creation&site=" + site + "&filter=withBody";

	var request = new XMLHttpRequest();
	
	request.onload = function(d, e){
		var dataText = request.response;
		var data = JSON.parse(dataText);
		
		for(var i = 0; i < data.items.length; i++){
			var link = data.items[i].link;
			var title = data.items[i].title;
			var creationDate = data.items[i].creation_date;
			var questionID = data.items[i].question_id;
			var body = data.items[i].body;
			addQuestion(link, title, creationDate, site, questionID, body);
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

var crawlType = "answers";

function crawler(){
	
	if(crawlType == "answers"){
		crawlAnswers(site());
	}
	else{
		crawlQuestions(site());
	}
	
	//console.log("crawling");
	
	setTimeout(crawler, 2000);
}

function startCrawlingAnswers(){
	
	crawlType = "answers";
	crawler();
	
}

function setQuestionAnswer(id, body){

	for(var i = 0; i < questions.length; i++){
		if( questions[i].questionID == id){
			questions[i].answer = body;
			return;
		}
	}
	
}

function crawlAnswers(site){
	var questionsWithThisSite = [];

	for(var i = 0; i < questions.length; i++){
		if(questions[i].site == site && questions[i].answer == undefined && questions[i].isBad == false){
			questionsWithThisSite.push(questions[i]);
		}
	}
	
	if(questionsWithThisSite.length == 0){
		return;
	}
	
	var IDs = [];
	
	var maxNum = Math.min(questionsWithThisSite.length, 90);
	
	for(var i = 0; i < maxNum; i++){
		IDs.push(questionsWithThisSite[i].questionID);
	}
	
	var IDstring = IDs.join(";");
	
	var callString = "https://api.stackexchange.com/2.2/questions/" + IDstring + "/answers?site=" + site + "&filter=!9YdnSM68i";
	
	var request = new XMLHttpRequest();
	
	request.onload = function(d, e){
		var dataText = request.response;
		var data = JSON.parse(dataText);
		
		for(var i = 0; i < data.items.length; i++){
			var questionID = data.items[i].question_id;
			var answerID = data.items[i].answer_id;
			var body = data.items[i].body;

			setQuestionAnswer(questionID, body);
		}
		
		printQuestions();
	}
	
	request.open("GET", callString,true);
	
	request.send();
}



function crawlQuestions(site){
	
	
}

