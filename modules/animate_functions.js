export class sprite{//takes basic animation. more can be added after construction
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

export class animation{//takes frames of an animation and positive numbers indicating wait time
	constructor(frames){
		this.framelist=frames;
		this.index=0;
		this.len=this.framelist.length;
		this.fin=true;
		this.counter=-1;
	}
	move(dx,dy){
		for(var i=0;i<this.len;++i){
			this.framelist[i].move(dx,dy);
		}
	}
	step(){
		var out;
		if(typeof this.framelist[this.index]=="number"){
			if (this.counter<0) this.counter=this.framelist[this.index];
			if (this.counter>0) out=this.framelist[this.index-1].print();
			else{
				this.counter-=1;
				this.index++;
				if(this.index>=this.len){
					this.index=0;
					this.fin=true;
				}
				return this.step();
			}
			this.counter-=1;
			return out;
		}
		else{
			out=this.framelist[this.index++].print();
			this.fin=false;
		}
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

export class frame{//assembles basic svg elements into a frame object
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

export class cirlce{
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
export class beziar{
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
