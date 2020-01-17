//document.body.style.cursor='none';
var speed=1;

//only write one piece of text at a time
var lock;
var mousepos=[0,0];
var wsize=[window.innerWidth,window.innerHeight];

const svg_element=document.getElementById("svg");

import {beziar, frame, animation, sprite} from './modules/animate_functions.js';

var adsf=new beziar([50,50],[200,30],[80,20],[60,60],"aaaaaa",5);
var objs=new beziar([50,50],[200,30],[80,20],[60,60],"45696e",5);
objs=objs.slice(0,.8);
var f1=new frame([adsf,objs]);
var obs2=new beziar([50,50],[200,30],[80,20],[60,60],"45696e",5);
obs2=obs2.slice(0,.6)
frames=[];
for(var i=1;i<=20;i++){
	var curve=new beziar([50,50],[200,30],[80,20],[60,60],"45696e",5);
	curve=curve.slice(0,i/20);
	var f=new frame([adsf,curve])
	frames.push(f);
	frames.push(i);
}
var ani=new animation(frames);
var spr=new sprite(ani);

function animate_svg(time){
	
	var header="<svg width=\""+wsize[0]+"\" height=\""+wsize[1]+"\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:svg=\"http://www.w3.org/2000/svg\"><g class=\"layer\"><title>Layer 1</title>\n";
	var footer='\n</g></svg>';
	var out=header+adsf.print()+spr.draw()+footer;
	//console.log(out);
	svg_element.innerHTML=out;
	requestAnimationFrame(animate_svg);
	
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
	document.getElementById("debug").innerHTML+="<p>"+text+"</p>";
}




requestAnimationFrame(animate_svg);
