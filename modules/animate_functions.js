export class sprite{//takes svg file and instruction set
	//vector sprite animation based on switching layers between visible and not
	constructor(svg){
		//set svg, relevent svg layers
		var e=document.getElementById(svg);
		var raw=e.contentWindow.document.childNodes[1];
		//pull data from headers (viewbox)
		this.headers=raw.attributes;
		
		raw=raw.childNodes;
		var layers=[];
		var layernums=[];
		for(var i=0; i<raw.length; i++){
			//parse raw to find the elements we care about
			if(raw[i]["childNodes"].length!=0){
				layernums.push(i);
				layers.push(raw[i]);
			}
		}
		//split layers into frames
		var spritesheets=[];
		var frames=[];
		this.layersData=[]
		for(var i=1; i<layers.length; i++){
			for(var j=1; j<layers[i]["childNodes"].length; j++){
				if(layers[i]["childNodes"][j]["childNodes"].length==0)continue;
				frames.push(layers[i]["childNodes"][j].innerHTML)
			}
			//LayersData holds all the data avalible in the layer tag. Some is neccecary for proper display (like translate) 
			this.layersData.push(layers[i]["attributes"])
			if(this.layersData[this.layersData.length-1][2].nodeValue=="idle")this.idleIndex=spritesheets.length;//Atribute 2 is "inkscape:label"
			spritesheets.push(frames);
			frames=[];
		}
		//this.e=e;
		//this.raw=raw;
		//this.backupIndexs=layernums;
		this.spriteSheets=spritesheets;
		//this.backup=raw;
		this.x=80;
		this.y=-30;
		this.stack=[];
		this.layerIndex=this.idleIndex;
		this.timer=[0];
		this.currentFrame="";
		//get length and width of animation space for scale
		var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],x=w.innerWidth||e.clientWidth||g.clientWidth,y=w.innerHeight||e.clientHeight||g.clientHeight;
		this.width=x;
		this.height=y;
		this.memory=[];
	}
	
	print(svg){
		//output text for current frame
		var out=svg;
		this.currentFrame=out;
		return out;
	}
	idle(){//overwrites animation stack and layerIndex with idle (overwrite)
		this.layerIndex=this.idleIndex;
		this.stack=this.svg_reformat(this.spriteSheets[this.idleIndex]);//deep copy spritesheet
		var timer=[];
		for (var i=0;i<this.stack.length;i++)timer.push(1);
		this.timer=timer;
		this.currentFrame=this.print(this.stack[0]);
	}
	next(){//returns next frame in stack. Idles if stack is empty.
		//returns current frame if timer>0
		if(this.stack.length==0) this.idle();
		if(this.timer[0]>0){this.timer[0]-=1;return this.currentFrame}
		var nextFrame=this.stack.shift();
		this.svg_ai();
		nextFrame=this.svg_set_position(nextFrame);
		this.timer.shift();
		return this.print(nextFrame);
	}
	svg_reformat(raw){//takes frames of partial svg data aray and formats it to proper svg
		//get header data from original
		var layerLabel="<g ";
		var layerData=this.layersData[this.layerIndex];
		for(var i=0;i<layerData.length;i++){
			
			layerLabel+=layerData[i].name+"=\""+layerData[i].value+"\"\n";
		}
		layerLabel+=">";
		
		var header="<svg "
		for(var i=0;i<this.headers.length;i++){
			if(this.headers[i].name=="width" || this.headers[i].name=="height") continue;
			header+=this.headers[i].name+"=\""+this.headers[i].value+"\"\n";
		}
		header+="width=\""+this.width+"px\" height=\""+this.height+"px\">\n";
		var footer='\n</g></svg>';
		
		//add everything together
		var out=[]
		for(var i=0;i<raw.length;i++){
			out.push(header+layerLabel+raw[i]+footer);
		}
		return out;
	}
	svg_set_position(svg){//adds this.x and y to svg
		//parse svg into xml
		var parsed;
		if (window.DOMParser)
		{
			var parser = new DOMParser();
			parsed = parser.parseFromString(svg, "text/xml");
		}
		else
		{
			parsed = new ActiveXObject("Microsoft.XMLDOM");
			parsed.async = false;
			parsed.loadXML(svg);
		}
		var elements=parsed.getElementsByTagName("path");
		//add values to each element
		var tmp=[];
		var xy=[];
		var str="";
		for(var i=0;i<elements.length;i++){
			tmp=elements[i].attributes["d"].value.split(" ")
			//console.log(tmp);
			xy=tmp[1].split(",");
			xy=[this.x+Number(xy[0]),this.y+Number(xy[1])];
			tmp[1]=xy[0]+","+xy[1];
			str="";
			for(;tmp.length>0;str+=tmp.shift()+" ");//I'm unreasonably proud of this for loop :D
			elements[i].attributes["d"].value=str;
		}
		//return to string and output
		str="";
		for(var i=0;i<elements.length;i++){
			str+=elements[i].outerHTML+"\n";
		}		
		svg=this.svg_reformat([str]);
		
		
		return svg;
	}
	svg_ai(){//changes changes things like position every tick (overwrite) 
		//this.x+=1, this.y+=1;
		return;
	}
}

class path{//abstract beziar curve. This is going to take a lot of math
	constructor(points,absolute){//takes an array of 4 points [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
		this.start=points[0];
		this.end=points[points.length-1];
		this.points=points;
		this.absolute=absolute;//are the points in absolute value or relative to the start?
	}
	split(t){//subdivides the path at the percentage through, t, returning 2 paths.
		function midpoint(p1,p2,t){//finds the altered midpoint between 2 points
			var x=p1[0]+(p2[0]-p1[0])*t;
			var y=p1[1]+(p2[1]-p1[1])*t;
			return [x,y];
		}
		if(t==0) return [new path([this.start,[0,0],[0,0],[0,0]],false),new path(this.points,this.absolute)];
		if(t==1) return [new path(this.points,this.absolute),new path([this.end,[0,0],[0,0],[0,0]],false)];
		
		var l1=0;//if relative handle first point differently
		if(this.absolute)l1=midpoint(this.start,this.points[1],t);
		else l1=midpoint([0,0],this.points[1],t);
		
		var m=midpoint(this.points[1],this.points[2],t);
		var r2=midpoint(this.points[2],this.end,t);
		var l2=midpoint(l1,m,t);
		var r1=midpoint(m,r2,t);
		var c=midpoint(l2,r1,t);
		
		if(this.absolute)return [new path([this.start,l1,l2,c],true),new path([c,r1,r2,this.end],true)];
		function add_p(p1,p2){//adds the x and y components of 2 points
			return [p1[0]+p2[0],p1[1]+p2[1]];
		}
		var nc=[c[0]*-1,c[1]*-1];
		var r=[add_p(this.start,c),add_p(r1,nc),add_p(r2,nc),add_p(this.end,nc)];
		
		return [new path([this.start,l1,l2,c],false),new path(r,false)];
	}
	extend(p1, p2){//produces a new curve that attatches continuously from this curve to the 2nd point modified by the first
		
		
	}
	length(){//finds the length of the curve (i think, not sure if this actually checks out
		function dist(p1,p2){
			return Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2));
		}
		d1=this.help_len();
		tmps=this.split(.5);
		d2=tmps[0].help_len()+tmps[1].help_len();
		return (2*d2)-d1;//there's no way this is actually right.
		
	}
	help_len(){
		return dist(this.start,this.points[1])+dist(this.points[1],this.points[2])+dist(this.points[2],this.end);
	}
}
