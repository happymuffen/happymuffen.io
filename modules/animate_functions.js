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
		
		
		return svg[0];
	}
	svg_ai(){//changes changes things like position every tick (overwrite) 
		//this.x+=1, this.y+=1;
		return;
	}
}

export class path{//abstract beziar curve. This is going to take a lot of math
	constructor(points,absolute){//takes an array of 4 points [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
		this.start=points[0];
		this.end=points[points.length-1];
		this.points=points;
		this.absolute=absolute;//are the points in absolute value or relative to the start?
	}
	
	
	get_point(t){//gets x,y value at a point t% along the path
		//B(t)=(1-t)^3*P0+3(1-t)^2*t*P1+3(1-t)*t^2*P2+t^3P3,	0<=t<=1
		var x=0;
		var y=0;
		for(var i=1;i<3;i++){
			x+=3*Math.pow(1-t,3-i)*Math.pow(t,i)*this.points[i][0];
			y+=3*Math.pow(1-t,3-i)*Math.pow(t,i)*this.points[i][1];
		}
		x+=Math.pow(1-t,3)*this.end[0];
		y+=Math.pow(1-t,3)*this.end[1];
		if(this.absolute){
			x+=Math.pow(1-t,3)*this.start[0];
			y+=Math.pow(1-t,3)*this.start[1];
		}
		else{
			x+=this.start[0];
			y+=this.start[1];
		}
		return [x,y];
	}
	get_slope(t){//finds derivative of curve at a point %t along the path
		//B'(t)=3(1-t)^2(P1-P0)+6(1-t)t(P2-P1)+3t^2(P3-P2),	0<=t<=1
		var dx=0, dy=0;
		var start=[0,0];
		if(this.absolute)start=this.start;
		dx=3*Math.pow(1-t,2)*(this.points[1][0]-start[0]);
		dx+=6*(1-t)*t*(this.points[2][0]-this.points[1][0]);
		dx+=3*Math.pow(t,2)*(this.end[0]-this.points[2][0]);
		
		dy=3*Math.pow(1-t,2)*(this.points[1][1]-start[1]);
		dy+=6*(1-t)*t*(this.points[2][1]-this.points[1][1]);
		dy+=3*Math.pow(t,2)*(this.end[1]-this.points[2][1]);
		
		return [dx,dy];
	}
	
	//transform functions
	translate(d){//produces new curve translated by d
		var points=this.points;
		if(this.absolute){
			for(var i=0;i>4;i++){
				points[i]=[points[i][0]+c[0],points[i][1]+c[1]];
			}
		}
		else points[0]=[points[0][0]+c[0],points[0][1]+c[1]];
		return new path(points,this.absolute);
	}
	rotate(c,t){//produces a new curve rotated about point c by angle t (radians)
		//shift everything so c is at 0,0
		var shift=this.translate([c[0]*-1,c[1]*-1]);
		var points=shift.points;
		//rotate everything
		var start
		for(var i=0;i<4;i++){
			var x=[points[i][0]*Math.cos(t)-points[i][1]*Math.sin(t)];
			var y=[points[i][1]*Math.cos(t)+points[i][0]*Math.sin(t)];
			points[i]=[x,y];
		}
		//shifts everything back
		shift=new path(points,this.absolute);
		return shift.translate(c);
	}
	skew(c,d){//multiplies eveything by scaler d[] reletive to point c
		//reposition points to be reletive to c
		var points=this.points
		var x=0,y=0;
		points[0]=[points[0][0]-c[0],points[0][1]-c[1]];
		if(this.absolute){
			for(var i=1;i<4;i++){
				points[i]=[points[i][0]-c[0],points[i][1]-c[1]];
			}
		}
		else{
			for(var i=1;i<4;i++){
				points[i]=[points[i][0]+points[0][0],points[i][1]+points[0][1]];
			}
		}
		//skew everything
		for(var i=0;i<4;i++){
			point[i]=[point[i][0]*d[0],point[i][1]*d[1]];
		}
		//reposition everything back
		if(this.absolute){
			for(var i=0;i<4;i++){
				points[i]=[points[i][0]+c[0],points[i][1]+c[1]];
			}
			return new curve(points,true);
		}
		for(var i=1;i<4;i++){
			points[i]=[points[i][0]-points[0][0],points[i][1]-points[0][1]];
			
		}
		points[0]=[points[0][0]+c[0],points[0][1]+c[1]];
		return new curve(points,false);
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
	extend(p3, p4){//produces a new curve that attatches continuously from this curve to the 2nd point modified by the first
		var p1=[];
		var p2=[];
		if (this.absolute){
			p1=this.end;
			var dx=this.points[2][0]-p1[0];
			var dy=this.points[2][1]-p1[1];
			p2=[p1[0]-dx,p1[1]-dy];
		}
		else{
			p1=[this.start[0]+this.end[0].this.start[1]+this.end[1]];
			var x=(this.points[2][0]-this.end[0])*-1;
			var y=(this.points[2][1]-this.end[1])*-1;
			p2=[x,y];
		}
		return new path([p1,p2,p3,p4],this.absolute);
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
	help_len(){//helper function for finding length
		return dist(this.start,this.points[1])+dist(this.points[1],this.points[2])+dist(this.points[2],this.end);
	}
}
