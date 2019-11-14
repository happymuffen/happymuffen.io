document.getElementById("body").innerHTML="Hello World";


var aboutText=document.getElementById("about").innerHTML;
var skillsText=document.getElementById("skills").innerHTML;
var projectsText=document.getElementById("projects").innerHTML;
var philosophyText=document.getElementById("philosophy").innerHTML;
var artText=document.getElementById("art").innerHTML;
var contactText=document.getElementById("contact").innerHTML;

document.getElementById("about").innerHTML="";
document.getElementById("skills").innerHTML="";
document.getElementById("projects").innerHTML="";
document.getElementById("philosophy").innerHTML="";
document.getElementById("art").innerHTML="";
document.getElementById("contact").innerHTML="";

function multianimate(text,element){
	var pars=text.split("\n");
	var len=pars.length;
	var strs=[""];
	var lens=[pars[0].length];
	var dones=[""];
	var counts=[0];
	for(i=1;i<len;i++){
		strs=strs.concat([""]);
		lens=lens.concat([pars[i].length]);
		dones=dones.concat([""]);
		counts=counts.concat([0]);
	}
	
	function display(){
		var str="";
		
		
		for(i=0;i<len;i++){
			str+="<p>"+strs[i]+dones[i];
		}
		
		document.getElementById(element).innerHTML=str;
	}
	function looper(index){
		if (counts[index]<lens[index]){
			dones[index]="|";
			strs[index]+=pars[index][counts[index]++];
			display();
			var delay=100*Math.random();
			setTimeout(looper,delay,index);
		}
		else{
			dones[index]="";
			display();
		}
	}
	
	
	for(i=0;i<len;i++){
		setTimeout(looper,300*i,i);
	}
}
function about(){
	multianimate(aboutText,"body");
}
function skills(){
	multianimate(skillsText,"body");
}
function projects(){
	multianimate(projectsText,"body");
}
function philosophy(){
	multianimate(philosophyText,"body");
}
function art(){
	multianimate(artText,"body");
}
function contact(){
	multianimate(contactText,"body");
}

multianimate(aboutText,"body");
