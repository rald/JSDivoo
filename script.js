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

var btnSave=document.getElementById("btnSave");

var saveArea=document.getElementById("saveArea");

var btnEyedrop=document.getElementById("btnEyedrop");

var btnFill=document.getElementById("btnFill");

var btnGIF=document.getElementById("btnGIF");

var output=document.getElementById("output");

var ctx=canvas.getContext("2d");

var cfs="#ffffff";
var css="#C0C0C0";

var playing=false;
var eyedropping=false;
var filling=false;
var hold=false;

canvas.width=256;
canvas.height=256;

var boxCols=16;
var boxRows=16;

var boxWidth=canvas.width/boxCols;
var boxHeight=canvas.height/boxRows;

ctx.fillStyle="#000000";
ctx.fillRect(0,0,canvas.width,canvas.height);

color.value=cfs;
hex.value=cfs;

var frame=0;
var bitmap=[];
var arr=[];
for(var i=0;i<boxCols*boxRows;i++) {
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
	for(var j=0;j<boxRows;j++) {
		for(var i=0;i<boxCols;i++) {
			box(i*boxWidth,j*boxHeight,boxWidth,boxHeight,bitmap[f][i+j*16],css);
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

hex.addEventListener("change",function(e) {
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
		var arr=[];
		for (var i = 0; i < boxCols*boxRows; i++) {
			arr.push("#000000");
		}
		bitmap.unshift(arr);
		update(0);
	}
});

next.addEventListener("click",function(e) {
	if(frame<bitmap.length-1) {
		frame++;
		update(frame);
	} else {
		var arr = [];
		for (var i = 0; i < boxCols*boxRows; i++) {
			arr.push("#000000");
		}
		bitmap.push(arr);
		update(bitmap.length-1);
	}
});

minus.addEventListener("click",function(e) {
	if(bitmap.length>1) {
		if(confirm("Remove frame "+frame+"?")) {
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
	var arr=[];
	for (var i = 0; i < boxCols*boxRows; i++) {
		arr.push("#000000");
	}
	insert(bitmap,frame,arr);
	update(frame);
});

function disableControls() {
		var controls = document.getElementsByClassName("controls");
	
		for (var i = 0; i < controls.length; i++) {
			var nodes = controls[i].getElementsByTagName("*");
			for (var j = 0; j < nodes.length; j++) {
				nodes[j].disabled = true;
			}
		}
}

function enableControls() {
	var controls = document.getElementsByClassName("controls");
	for (var i = 0; i < controls.length; i++) {
		var nodes=controls[i].getElementsByTagName("*");
		for(var j=0;j<nodes.length;j++) {
			nodes[j].disabled = false;
		}
	}
}

btnPlay.addEventListener("click",function(e) {
	
	if(eyedropping) return false;
	
	playing=true;
	
	btnPlay.style.border="1px solid black";
	
	disableControls();
	
	clearInterval(animationInterval);
	animationInterval=setInterval(animate,500);
});

btnPause.addEventListener("click",function(e) {
	
	if(eyedropping) return false;
	if(filling) return false;
	
	playing=false;
	
	btnPlay.style.border="1px solid transparent";
		
	enableControls();

	clearInterval(animationInterval);
	animationInterval=setInterval(draw,1000/60);
});

frameNumber.addEventListener("change",function(e) {
	update(frameNumber.value);
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

btnEyedrop.addEventListener("click", function(e) {
	
	if(playing) return false;
	if(filling) return false;

	if(eyedropping) {
			enableControls();
		
			clearInterval(animationInterval);
			animationInterval = setInterval(draw, 1000 / 60);
		
			btnEyedrop.style.border = "1px solid transparent";
		
			eyedropping = false;
		return false;
	}

	eyedropping=true;

	btnEyedrop.style.border="1px solid black";

	disableControls();
	
	clearInterval(animationInterval);
	animationInterval = setInterval(eyedropColor, 1000/60);
});

btnFill.addEventListener("click", function(e) {
	
	if(playing) return false;
	if(eyedropping) return false;

	if(filling) {
			enableControls();
		
			clearInterval(animationInterval);
			animationInterval = setInterval(draw, 1000 / 60);
		
			btnFill.style.border = "1px solid transparent";
		
			filling = false;
		
		return false;
	}

	filling=true;

	btnFill.style.border="1px solid black";

	disableControls();
	
	clearInterval(animationInterval);
	animationInterval = setInterval(fillColor, 1000/60);
});

btnGIF.addEventListener("click", function(e) {
	
	var gif = new GIF({
		workers: 2,
		quality: 10
	});
	
	var cvss=[];
	for(var k=0;k<bitmap.length;k++) {
		var cvsx=document.createElement("canvas");
		cvsx.width=canvas.width;
		cvsx.height=canvas.height;
		var ctxx=cvsx.getContext("2d");
		for(var j=0;j<boxRows;j++) {
			for(var i=0;i<boxCols;i++) {
				ctxx.fillStyle=bitmap[k][i+j*boxCols];
				ctxx.fillRect(i*boxWidth,j*boxHeight,boxWidth,boxHeight);
			}
		}
		gif.addFrame(cvsx);
	}
	
	gif.on('finished', function(blob) {
	/*
		var img=document.createElement("img");
		img.src=URL.createObjectURL(blob);
		output.innerHTML="";
		output.appendChild(img);
	*/
		saveData(blob,"animation.gif");

	});
	
	gif.render();
	
});

var saveData = (function() {
	var a = document.createElement("a");
	document.body.appendChild(a);
	a.style = "display: none";
	return function(data, fileName) {
		var json = JSON.stringify(data),
			blob = new Blob([json], { type: "octet/stream" }),
			url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	};
}());


function animate() {
	if (frame < bitmap.length-1) {
		frame++;
	} else {
		frame = 0;
	}
	update(frame);
}

function eyedropColor() {
		if (isMouseDown) {
			var i = Math.floor(mousePos.x / boxWidth);
			var j = Math.floor(mousePos.y / boxHeight);
			cfs = bitmap[frame][i + j * boxCols];
			color.value = cfs;
			enableControls();
			
			clearInterval(animationInterval);
			animationInterval = setInterval(draw, 1000 / 60);		
			
			btnEyedrop.style.border="1px solid transparent";

			eyedropping = false;
		}	
}

function floodFillUtil(x,y,c1,c2) {
	if(x<0 || x>=boxCols || y<0 || y>=boxRows) return;
	var c3=bitmap[frame][x+y*boxCols];
	if(c2==c3) {
		bitmap[frame][x+y*boxCols]=c1;
		floodFillUtil(x,y-1,c1,c2);
		floodFillUtil(x,y+1,c1,c2);
		floodFillUtil(x-1,y,c1,c2);
		floodFillUtil(x+1,y,c1,c2);
	}
}

function floodFill(x,y) {
	var c1=cfs;
	var c2=bitmap[frame][x+y*boxCols];
	if(c1!=c2) {
		floodFillUtil(x,y,c1,c2);
	}
	update(frame);
}

function fillColor() {
		if (isMouseDown) {
			
			var i = Math.floor(mousePos.x / boxWidth);
			var j = Math.floor(mousePos.y / boxHeight);
		
			floodFill(i,j);
		
			enableControls();
			
			clearInterval(animationInterval);
			animationInterval = setInterval(draw, 1000 / 60);		
			
			btnFill.style.border="1px solid transparent";

			filling = false;
		}	
}


function draw() {
	if(drawing) {
		var i=Math.floor(mousePos.x/boxWidth);
		var j=Math.floor(mousePos.y/boxHeight);
		bitmap[frame][i+j*boxCols]=cfs;
		box(i*boxWidth,j*boxHeight,boxWidth,boxHeight,cfs,css);
	} 
}

update(0);

animationInterval=setInterval(draw,1000/60);

canvas.addEventListener("touchstart", function(event) { event.preventDefault() });
canvas.addEventListener("touchmove", function(event) { event.preventDefault() });
canvas.addEventListener("touchend", function(event) { event.preventDefault() });
canvas.addEventListener("touchcancel", function(event) { event.preventDefault() });
