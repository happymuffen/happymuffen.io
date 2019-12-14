//document.body.style.cursor='none';
var speed=1;

//only write one piece of text at a time
var lock;
var mousepos=[0,0];
var wsize=[window.innerWidth,window.innerHeight];

var svg_element="svg";

class beziar{
	constructor(p0,p1,p2,p3,color,width){
		this.curve=[p0,p1,p2,p3];
		this.color=color;
		this.width=width;
	}
	slice(per0,per1){
		function midpnt(p0,p1,per){
			var x=p0[0]+(p1[0]-p0[0])*per;
			var y=p0[1]+(p1[1]-p0[1])*per;
			return [x,y];
		}
		function split(b0,b1,b2,b3,per){
			if(per==0) return [new beziar(b0,b0,b0,b0,this.color,this.width),new beziar(b0,b1,b2,b3,this.color,this.width)];
			if(per==1) return [new beziar(b0,b1,b2,b3),new beziar(b3,b3,b3,b3,this.color,this.width,this.color,this.width)];
			var l1=midpnt(b0,b1);
			var m=midpnt(b1,b2);
			var r2=midpnt(b2,b3);
			var l2=midpnt(l1,m);
			var r1=midpnt(m,r2);
			var splt=midpnt(l2,r1);
			var l=new beziar(b0,l1,l2,splt);
			var r=new beziar(splt,r1,r2,b1);
			return [l,r];
		}
		if(per0>1||per0<0||per1>1||per1<0){
			return null;
		}
		var splt=split(this.curve[0],this.curve[1],this.curve[2],this.curve[3],per1);
		var final=split(splt[1].curve[0],splt[1].curve[1],splt[1].curve[2],splt[1].curve[3],per1*per0);
		
		return final[0];
	}
	print(){
		var d="m"+this.curve[0][0]+","+this.curve[0][1]+"c"+this.curve[1][0]+","+this.curve[1][1]+" "+this.curve[2][0]+","+this.curve[2][1]+" "+this.curve[3][0]+","+this.curve[3][1];
		var out="<path d=\""+d+"\" id=\"asdf\" stroke=\"#"+this.color+"\" stroke-width=\""+this.width+"\" fill=\"none\" stroke-linecap=\"round\">";
		return out;
	}
}

var objs=new beziar([10,20],[30,40],[500,60],[8,90],"45696e",5);

function animate_text(text,element){
	
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

function animate_svg(time){
	
	var header="<svg width=\""+wsize[0]+"\" height=\""+wsize[1]+"\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:svg=\"http://www.w3.org/2000/svg\"><g class=\"layer\"><title>Layer 1</title>\n";
	var footer='\n</g></svg>';
	var out=header+objs.print()+footer;

	document.getElementById(svg_element).innerHTML=out;
	//requestAnimationFrame(animate_svg);
	
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
	document.getElementById("debug").innerHTML="<p>\\"+text+"";
}

//~ function mousemove(event){
	//~ mousepos=[event.clientX,event.clientY];
//~ }


requestAnimationFrame(animate_svg);
