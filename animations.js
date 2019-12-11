//document.body.style.cursor='none';
var speed=1;

//only write one piece of text at a time
var lock;
var mousepos=[0,0];
var wsize=[window.innerWidth,window.innerHeight];


function init(){
	cursor=document.getElementById("cursor");
}


function animate(text,element){
	
	lock=text;
	var len=text.length;
	var str="";
	var i=0;
	
	function looper(){//idea: parse "\" as escape char
		if (lock!=text) return;
		if (i<len){
			var c=text[i++];
			if(c=="\n") c="<p>";
			str+=c;
			document.getElementById(element).innerHTML=str+"|";
			var delay=70*Math.random()+10;
			//pause for effect
			if(c=="." || c=="?") delay=300;
			if(c=="," || c==":" || c==";" || c=="(") delay=200
			delay/=speed;
			delay=0;
			setTimeout(looper,delay);
		}
		else{
			document.getElementById(element).innerHTML=str;
		}
	}
	looper();
}
	
//~ function mouseloop(time){
	//~ <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
		 //~ <g class="layer">
		  //~ <title>Layer 1</title>
		  //~ <circle r="3" cx="5" cy="5" fill="none" id="cursor" stroke="#45696e" stroke-dasharray="null" stroke-linecap="round" stroke-linejoin="null" stroke-width="4" x1="4" x2="496" y1="2" y2="2"/>
		 //~ </g>
		//~ </svg>
	//~ </div>
	//~ cursor=document.getElementById("cursor");
	//~ cursor.innerHTML='<svg width="'+wsize[0]+'" height="'+wsize[1]+'" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><g class="layer"><title>Layer 1</title><circle r="2" cx="'+mousepos[0]+'" cy="'+mousepos[1]+'" fill="none" id="cursor" stroke="#45696e" stroke-dasharray="null" stroke-linecap="round" stroke-linejoin="null" stroke-width="4" x1="4" x2="496" y1="2" y2="2"/></g></svg></div>'
	//~ requestAnimationFrame(mouseloop);
	//~ debug(mousepos);
//~ }

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
			requestAnimationFrame(display);
			var delay=100*Math.random();
			setTimeout(looper,delay,index);
		}
		else{
			dones[index]="";
			requestAnimationFrame(display);
		}
	}
	
	
	for(i=0;i<len;i++){
		setTimeout(looper,300*i,i);
	}
}
function about(){
	animate(aboutText,"body");
}
function skills(){
	animate(skillsText,"body");
}
function projects(){
	animate(projectsText,"body");
}
function philosophy(){
	animate(philosophyText,"body");
}
function art(){
	animate(artText,"body");
}
function contact(){
	animate(contactText,"body");
}

function debug(text){
	document.getElementById("debug").innerHTML="<p>"+text;
}

function mousemove(event){
	mousepos=[event.clientX,event.clientY];
}



//requestAnimationFrame(mouseloop);
