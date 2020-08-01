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
			if(layers[i]["attributes"][0].nodeValue=="center"){
				var tmp=layers[i].innerHTML.match(/\d+\.\d+,\d+\.\d+/gi)[0].split(",");
				this.center=tmp.map(Number);
			}
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
		this.lmp=[0,0];
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
		this.svg_ai();
		var nextFrame=this.stack.shift();
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
		
		
		return svg[0];
	}
	svg_ai(){//changes changes things like position every tick (overwrite) 
		//this.x+=1, this.y+=1;
		return;
	}
}

export class path{//abstract beziar curve. This is going to take a lot of math
	constructor(points,absolute){//takes an array of points [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
		this.start=points[0];
		this.end=points[points.length-1];
		this.points=points;
		this.absolute=absolute;//are the points in absolute value or relative to the start?
	}
	//inkscape doesn't mearly append new points to the end to extend a curve,
	//it sets the end point as the new origin for the next set of points
	
	set abs(b){
		if(this.absolute==b)return;
		if(b){
			var o=this.start;
			for(var i=1;i<this.points.length;i++){
				this.points[i][0]+=o[0];
				this.points[i][1]+=o[1];
				if(i%3==0)o=this.points[i];
			}
		}
		else{
			var o=this.start;
			for(var i=1;i<this.points.length;i++){
				this.points[i][0]-=o[0];
				this.points[i][1]-=o[1];
				if(i%3==0){
					o[0]+=this.points[i][0];
					o[1]+=this.points[i][1];
				}
			}
		}
		
		this.absolute=b;
	}
	
	split(t){//subdivides the path at the percentage through, t, returning 2 paths.
		function midpoint(p1,p2,t){//finds the altered midpoint between 2 points
			var x=p1[0]+(p2[0]-p1[0])*t;
			var y=p1[1]+(p2[1]-p1[1])*t;
			return [x,y];
		}
		var l=[this.start],r=[];
		//sanity check
		if(t<=0) return [new path([this.start,[0,0],[0,0],[0,0]],false),new path(this.points,this.absolute)];
		
		for(var i=1;i<=t;i++){	//all full paths to the left of t get added to t
			l.push(this.points[i*3-2]);
			l.push(this.points[i*3-1]);
			l.push(this.points[i*3]);
		}
		var o=this.start;
		var i=1;
		for(;i<t;i++){
			o[0]+=this.points[3*i][0];
			o[1]+=this.points[3*1][1];
		}
		if(t%1){	//if some fraction of path
			//get path section			
			var p1=this.points[i*3+1];
			var p2=this.points[i*3+2];
			var p3=this.points[i*3+3];
			
			//split path section
			var start=[0,0];
			if(this.absolute)start=o;
			var l1=midpoint(start,p1,t-i);
			var m=midpoint(p1,p2,t-i);
			var r2=midpoint(p2,p3,t-i);
			var l2=midpoint(l1,m,t);
			var r1=midpoint(m,r2,t);
			var c=midpoint(l2,r1,t);
			//handle absolute/reletive
			l.push(l1,l2,c);
			if(this.absolute){//just push everything where it needs to be
				r.push(c,r1,r2);
				i*=3;
				for(;i<this.points.length;i++)r.push(this.points[i]);
			}
			else{
				r1=[c[0]+r1[0],c[1]+r1[1]];
				r2=[c[0]+r2[0],c[1]+r2[1]];
				p3=[c[0]+p3[0],c[1]+p3[1]];
				c=[c[0]+o[0],c[1]+o[1]];
				r.push(c,r1,r2,p3);
				i=i*3+1;
				for(;i<this.points.length;i++)r.push(this.points[i]);
			}
			//return paths
			return [l,r];
		}
		i*=3;
		for(;i<this.points.length;i++)r.push(this.points[i]);
		if(!this.absolute){
			r[0][0]+=o[0];
			r[0][1]+=o[1];
		}
		return [l,r];
	}
	
	get_point(t){//gets x,y value at a point t% along the path
		//B(t)=(1-t)^3*P0+3(1-t)^2*t*P1+3(1-t)*t^2*P2+t^3P3,	0<=t<=1
		
		//find relevent group of points
		var o=[0,0];
		var i=0;
		for(;i<t;i++){
				o[0]+=this.points[3*i][0];
				o[1]+=this.points[3*1][1];
		}
		if(i>0)i--;
		var p0=[0,0];
		if(this.absolute) p0=this.points[i];
		var p1=this.points[i+1];
		var p2=this.points[i+2];
		var p3=this.points[i+3];
		
		//use equation
		var p=t-i;
		var x=Math.pow(1-p,3)*p0[0];
		x+=3*Math.pow(1-p,2)*p*p1[0];
		x+=3*(1-p)*Math.pow(p,2)*(1-p)*p2[0];
		x+=Math.pow(p,3)*p3[0];
		
		var y=	Math.pow(1-p,3)*p0[1];
		y+=3*Math.pow(1-p,2)*p*p1[1];
		y+=3*(1-p)*Math.pow(p,2)*(1-p)*p2[1];
		y+=Math.pow(p,3)*p3[1];
		
		//handle absolute/reletive and return
		if(this.absolute) return [x,y];
		return [x+o[0],y+o[1]];
	}
	get_slope(t){//finds derivative of curve at a point %t along the path
		//B'(t)=3(1-t)^2(P1-P0)+6(1-t)t(P2-P1)+3t^2(P3-P2),	0<=t<=1
		
		//find relevent group of points
		var i=Math.floor(t)*3;
		if(t%1==0) i-=3;
		var p0=[0,0];
		if(this.absolute) p0=this.points[i];
		var p1=this.points[i+1];
		var p2=this.points[i+2];
		var p3=this.points[i+3];
		
		//use equation
		var start=[0,0];
		var p=t-i;
		var dx=3*Math.pow(1-p,2)*(p1[0]-p0[0]);
		dx+=6*(1-p)*p*(p2[0]-p1[0]);
		dx+=3*Math.pow(p,2)*(p3[0]-p2[0]);
		
		var dy=3*Math.pow(1-p,2)*(p1[1]-p0[1]);
		dy+=6*(1-p)*p*(p2[1]-p1[1]);
		dy+=3*Math.pow(p,2)*(p3[1]-p2[1]);
		
		return [dx,dy];
	}
	
	//transform functions
	translate(c){//produces new curve translated by d
		var points=this.points;
		if(this.absolute){
			for(var i=0;i<this.points.length;i++){
				points[i]=[points[i][0]+c[0],points[i][1]+c[1]];
			}
		}
		else{
			points[0]=[points[0][0]+c[0],points[0][1]+c[1]];
		}
		return new path(points,this.absolute);
	}
	rotate(c,t){//produces a new curve rotated about point c by angle t (radians)
		//shift everything so c is at 0,0
		var shift=this.translate([c[0]*-1,c[1]*-1]);
		shift.abs=true;
		var points=shift.points;
		//~ var os=points[0];
		
		//rotate everything
		for(var i=0;i<points.length;i++){
			var x=points[i][0]*Math.cos(t)-points[i][1]*Math.sin(t);
			var y=points[i][1]*Math.cos(t)+points[i][0]*Math.sin(t);
			points[i]=[x,y];
		}
		
		//shifts everything back
		shift=new path(points,true);
		shift=shift.translate(c);
		shift.abs=this.absolute;
		//~ console.log("center: "+c+"\ntheta: "+t+"\nold start: "+os+"\nnew start: "+points[0]);
		return shift;
	}
	skew(c,d){//multiplies eveything by scaler d[] reletive to point c
		
		//reposition points to be reletive to c
		var shift=this.translate([c[0]*-1,c[1]*-1]);
		shift.absolute=true;
		var points=shift.points;
		
		//skew everything
		for(var i=0;i<points.length;i++){
			points[i]=[points[i][0]*d[0],points[i][1]*d[1]];
		}
		//reposition everything back
		shift=new path(points,true);
		shift=shift.translate(c);
		shift.absolute=this.absolute;
		return shift;
	}
}
