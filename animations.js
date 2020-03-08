//document.body.style.cursor='none';
var speed=1;

//only write one piece of text at a time
var lock;
var mousepos=[0,0];
var wsize=[window.innerWidth,window.innerHeight];
var butterfly;

const svg_element=document.getElementById("svg");

import {sprite} from './modules/animate_functions.js';
import {bfjs} from './modules/butterfly.js';


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


function startBf(){
	const butterfly=new sprite("butterfly");
	bfjs(butterfly);
	butterfly.idle();
}

window.onload=startBf;

