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
		this.e=e;
		this.raw=raw;
		this.backupIndexs=layernums;
		this.spriteSheets=spritesheets;
		this.backup=raw;
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
	}
	
	print(svg){
		//output text for current frame
		var out=svg;
		this.currentFrame=out;
		return out;
	}
	idle(){//overwrites animation stack and layerIndex with idle
		this.layerIndex=this.idleIndex;
		this.stack=this.svg_reformat(this.spriteSheets[this.idleIndex]);//deep copy spritesheet
		var timer=[];
		for (var i=0;i<this.stack.length;i++)timer.push(1);
		this.timer=timer;
		this.currentFrame=this.print(this.stack[0]);
	}
	move(){//returns next frame in stack. Idles if stack is empty.
		//returns current frame if timer>0
		if(this.stack.length==0) this.idle();
		if(this.timer[0]>0){this.timer[0]-=1;return this.currentFrame}
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
			console.log(tmp);
			xy=tmp[1].split(",");
			xy=[this.x+Number(xy[0]),this.y+Number(xy[1])];
			tmp[1]=xy[0]+","+xy[1];
			str="";
			for(;tmp.length>0;str+=tmp.shift()+" ")//I'm unreasonably proud of this for loop :D
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
}
