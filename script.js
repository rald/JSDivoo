var canvas=document.getElementById("canvas");

var color=document.getElementById("color");

var hex=document.getElementById("hex");

var prev=document.getElementById("prev");

var next=document.getElementById("next");

var frameNumber=document.getElementById("frameNumber");

var minus=document.getElementById("minus");

var add=document.getElementById("add");

var btnPlay=document.getElementById("btnPlay");

var btnPause=document.getElementById("btnPause");

var controls=document.getElementById("controls");

var btnSave=document.getElementById("btnSave");

var saveArea=document.getElementById("saveArea");

var ctx=canvas.getContext("2d");

var cfs="#ffffff";
var css="#ffffff";

var playing=false;

canvas.width=512;
canvas.height=512;

ctx.fillStyle="#000000";
ctx.fillRect(0,0,canvas.width,canvas.height);

color.value=css;
hex.value=css;


var frame=0;
var bitmap=[];
var arr=[];
for(var i=0;i<256;i++) {
	arr.push("#000000");
}
bitmap.push(arr);



function box(x,y,w,h,fs,ss) {
	ctx.beginPath();
	ctx.strokeStyle=ss;
	ctx.fillStyle=fs;
	ctx.rect(x,y,w,h);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
}

function update(f) {
	for(var j=0;j<16;j++) {
		for(var i=0;i<16;i++) {
			box(i*32,j*32,32,32,bitmap[f][i+j*16],"#ffffff");
		}
	}
	frame=f;
	frameNumber.value=f;
}

function insert(arr,i,item) {
	arr.splice(i,0,item);
}

function remove(arr,i) {
	arr.splice(i,1);
}

color.addEventListener("input",function(e) {

	cfs=this.value;
	hex.value=this.value;
});

hex.addEventListener("change",function(e)
{


	if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(this.value)) {
		cfs=this.value;
		color.value=this.value;
	} else {
		this.value=cfs;
	}
});

prev.addEventListener("click",function(e) {
	

	if(frame>0) {
		frame--;
		update(frame);
	} else {
		if(confirm("Add frame at the beginning")) {
			var arr=[];
			for (var i = 0; i < 256; i++) {
				arr.push("#000000");
			}
			bitmap.unshift(arr);
			update(0);
			alert("Frame added");
		}
	}
});

next.addEventListener("click",function(e) {
	

	if(frame<bitmap.length-1) {
		frame++;
		update(frame);
	} else {
		if (confirm("Add a new frame")) {
			var arr = [];
			for (var i = 0; i < 256; i++) {
				arr.push("#000000");
			}
			bitmap.push(arr);
			update(bitmap.length-1);
			alert("Frame "+frame+" added");
		}
	}
});

minus.addEventListener("click",function(e) {
	

	if(bitmap.length>1) {
		if(confirm("Remove frame "+frame)) {
			remove(bitmap,frame);
			if(frame>bitmap.length-1) {
				frame=bitmap.length-1;
			}
			update(frame);
		}
	} else {
		alert("Cannot remove the only frame left");
	}
});

add.addEventListener("click",function(e) {
	
	
	if(confirm("Insert a frame before frame "+frame)) {
		var arr=[];
		for (var i = 0; i < 256; i++) {
			arr.push("#000000");
		}
		insert(bitmap,frame,arr);
		update(frame);
		alert("Frame "+frame+" inserted");
	}
});

btnPlay.addEventListener("click",function(e) {
		playing=true;
		
		var nodes = document.getElementById("controls").getElementsByTagName('*');
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].disabled = true;
		}
		
		
		clearInterval(animationInterval);
		animationInterval=setInterval(animate,500);
});

btnPause.addEventListener("click",function(e) {
		playing=false;
			
		var nodes = document.getElementById("controls").getElementsByTagName('*');
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].disabled = false;
		}	
	
		clearInterval(animationInterval);
		animationInterval=setInterval(draw,1000/60);
});

frameNumber.addEventListener("change",function(e) {
	update(frameNumber.value);
});

controls.addEventListener("click",function(e) {
	if(playing) {
		alert("Animation is playing. You mus pause it first.");
	}
});

btnSave.addEventListener("click",function(e) {
	

	saveArea.value=JSON.stringify(bitmap);
	
	saveArea.select();
	saveArea.setSelectionRange(0,99999);
	document.execCommand("copy");

});

btnLoad.addEventListener("click", function(e) {
	bitmap=JSON.parse(saveArea.value);
	update(0);
});


function animate() {
		if (frame < bitmap.length) {
			frame++;
		} else {
			frame = 0;
		}
		update(frame);
}


function draw() {
	if(drawing) {
		var i=Math.floor(mousePos.x/32);
		var j=Math.floor(mousePos.y/32);
		bitmap[frame][i+j*16]=cfs;
		box(i*32,j*32,32,32,cfs,css);
	}
	
	
}

update(0);

animationInterval=setInterval(draw,1000/60);