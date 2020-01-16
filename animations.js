//document.body.style.cursor='none';
var speed=1;

//only write one piece of text at a time
var lock;
var mousepos=[0,0];
var wsize=[window.innerWidth,window.innerHeight];

const svg_element=document.getElementById("svg");

class sprite{//takes basic animation. more can be added after construction
	constructor(idle){
		this.animations=[idle];
		this.queue=[];
	}
	addAnimation(){
		//TO DO
	}
	draw(){
		//checks if there is anything to animate. if not, idle
		if(!this.queue.length)this.queue=[0];
		var out=this.animations[this.queue[0]].step();
		if(this.animations[this.queue[0]].fin)this.queue.shift();
		return out;
	}
}

class animation{//takes frames of an animation
	constructor(frames){
		this.framelist=frames;
		this.index=0;
		this.len=this.framelist.length;
		this.fin=true;
	}
	move(dx,dy){
		for(var i=0;i<this.len;++i){
			this.framelist[i].move(dx,dy);
		}
	}
	step(){
		var out=this.framelist[this.index++].print();
		this.fin=false;
		if(this.index>=this.len){
			 this.index=0;
			 this.fin=true;
		 }
		return out;
	}
	wait(){
		return this.framelist[this.index].print();
	}
	reset(){
		this.index=0;
		this.fin=true;
	}
}

class frame{//assembles basic svg elements into a frame object
	constructor(curves){
		this.curves=curves;
	}
	move(dx,dy){
		for(var i=0;i<this.curves.length;++i){
			this.curves[i].move(dx,dy);
		}
	}
	recolor(color){
		for(var i=0;i<this.curves.length;++i){
			this.curves[i].recolor(color);
		}
	}
	print(){
		var out="";
		for(var i=0;i<this.curves.length;++i){
			out+=this.curves[i].print();
		}
		return out;
	}
}

class cirlce{
	constructor(c,r,color,width){
		this.coords=c;
		this.r=r;
		this.color=color;
		this.width=width;
	}
	move(dx,dy){
		this.coords[0]+=dx;
		this.coords[1]+=dy;
	}
	setpos(x,y){
		this.coords=[x,y];
	}
	recolor(color){
		this.color=color;
	}
	print(){
		//<circle r="3" cx="5" cy="5" fill="none" id="cursor" stroke="#45696e" stroke-dasharray="null" stroke-linecap="round" stroke-linejoin="null" stroke-width="4" x1="4" x2="496" y1="2" y2="2"/>
		var out="<circle r=\""+this.r+"\" cx=\""+this.coords[0]+"\" cy=\""+this.coords[1]+"\" fill=\"none\" id=\"circle\" stroke=\"#"+this.color+"\" stroke-width=\""+this.width+"\"/>";
		return out;
	}
}
class beziar{
	constructor(p0,p1,p2,p3,color,width){
		this.coords=[p0,p1,p2,p3];
		this.color=color;
		this.width=width;
	}
	slice(per0,per1){
		

		function midpnt(p0,p1,per){
			var x=p0[0]+(p1[0]-p0[0])*per;
			var y=p0[1]+(p1[1]-p0[1])*per;
			return [x,y];
		}
		function split(b0,b1,b2,b3,per,color,width){
			if(per==0) return [new beziar(b0,b0,b0,b0,color,width),new beziar(b0,b1,b2,b3,color,width)];
			if(per==1) return [new beziar(b0,b1,b2,b3,color,width),new beziar(b3,b3,b3,b3,color,width)];
			var l1=midpnt(b0,b1,per);
			var m=midpnt(b1,b2,per);
			var r2=midpnt(b2,b3,per);
			var l2=midpnt(l1,m,per);
			var r1=midpnt(m,r2,per);
			var splt=midpnt(l2,r1,per);
			//debug(b0+" "+b1+" "+b2+" "+b3);
			//debug(b0+" "+l1+" "+l2+" "+splt+" "+r1+" "+r2+" "+b3);
			var l=new beziar(b0,l1,l2,splt,color,width);
			var r=new beziar(splt,r1,r2,b3,color,width);
			return [l,r];
		}
		if(per0>1||per0<0||per1>1||per1<0){
			return null;
		}
		
		var splt=split(this.coords[0],this.coords[1],this.coords[2],this.coords[3],per1);
		var final=split(splt[0].coords[0],splt[0].coords[1],splt[0].coords[2],splt[0].coords[3],per0/per1,this.color,this.width);
		return final[1];
	}
	move(dx,dy){
		for (var i=0;i<4;++i){
			this.coords[i][0]+=dx;
			this.coords[i][1]+=dy;
		}
	}
	setpos(x,y){
		var dx=x-this.coords[0][0];
		var dy=y-this.coords[0][1];
		move(dx,dy);
	}
	recolor(color){
		this.color=color;
	}
	print(){
		var d="M"+this.coords[0][0]+","+this.coords[0][1]+"C"+this.coords[1][0]+","+this.coords[1][1]+" "+this.coords[2][0]+","+this.coords[2][1]+" "+this.coords[3][0]+","+this.coords[3][1];
		var out="<path d=\""+d+"\" id=\"asdf\" stroke=\"#"+this.color+"\" stroke-width=\""+this.width+"\" fill=\"none\" stroke-linecap=\"round\"></path>";
		return out;
	}
}

var adsf=new beziar([50,50],[200,30],[80,20],[60,60],"aaaaaa",5);
var objs=new beziar([50,50],[200,30],[80,20],[60,60],"45696e",5);
objs=objs.slice(0,.8);
var f1=new frame([adsf,objs]);
var obs2=new beziar([50,50],[200,30],[80,20],[60,60],"45696e",5);
obs2=obs2.slice(0,.6)
frames=[]
for(i=1;i<101;i++){
	var curve=new beziar([50,50],[200,30],[80,20],[60,60],"45696e",5);
	curve=curve.slice(0,i/100);
	var f=new frame([adsf,curve])
	frames.push(f);
}
var ani=new animation(frames);
var spr=new sprite(ani);

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
	var out=header+adsf.print()+spr.draw()+footer;
	//console.log(out);
	svg_element.innerHTML=out;
	requestAnimationFrame(animate_svg);
	
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
	for(var i=1;i<len;i++){
		strs=strs.concat([""]);
		lens=lens.concat([pars[i].length]);
		dones=dones.concat([""]);
		counts=counts.concat([0]);
	}
	
	function display(){
		var str="";
		
		
		for(var i=0;i<len;i++){
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
	
	
	for(var i=0;i<len;i++){
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
	document.getElementById("debug").innerHTML+="<p>"+text+"</p>";
}

//~ function mousemove(event){
	//~ mousepos=[event.clientX,event.clientY];
//~ }


requestAnimationFrame(animate_svg);
