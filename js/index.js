	var stage, textStage, form, input;
	var circles, textPixels, textFormed;
	var offsetX, offsetY, text;
	var flag = false;
	var now = "?";
	var list = new Array();
	var timeSpace = 250
	var numberL = 1000, numberR = 1200;
	var lastLength = 0;
	var maxFontSize = 300;
	var circleNum = 1200;
	var textW = 1000;
	var textH = 400;
	var colors = ['#FFF', '#effafa', '#faeff6', '#faf9ef', '#f1faef'];
	
	//添加已经抽出的号码，防止重复
	function addList(x){
		if (x<numberL || x>numberR){
			return;
		}
		var j = 0;
		for (; j < list.length ; j++){
			if (list[j] == x) break;
		}
		if (j == list.length){
			list.push(x);
			console.log('Delete: ' + list[list.length-1]);
		}
	}
	
	//监听空格回车
	document.onkeydown = function (event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (e && (e.keyCode == 13 || e.keyCode == 32)) {
			flag = ~flag;
			if (flag == false){
				numberNow = Number(now);
				var L = numberNow, R = numberNow;
				if (e.keyCode == 13){
					L = numberNow - numberNow%10 + 1;
					R = L + 9;
				}
				for (var i = L; i <= R; i++){
					addList(i);
				}
			}
		}
	};
	function init() {
		initStages();
		initForm();
		initText();
		initCircles();
		animate();
		addListeners();
	}

	// Init Canvas
	function initStages() {
		offsetX = (window.innerWidth-textW)/2;
		offsetY = (window.innerHeight-textH)/2;
		textStage = new createjs.Stage("text");
		textStage.canvas.width = textW;
		textStage.canvas.height = textH;

		stage = new createjs.Stage("stage");
		stage.canvas.width = window.innerWidth;
		stage.canvas.height = window.innerHeight;
	}

	function initForm() {
		form = document.getElementById('form');
		form.style.top = offsetY+textH+'px';
		form.style.left = offsetX+'px';
		input = document.getElementById('inputText');
	}

	function initText() {
		text = new createjs.Text("t", "80px 'Source Sans Pro'", "#eee");
		text.textAlign = 'center';
		//text.x = textW/2;
	}

	function initCircles() {
		circles = [];
		for(var i=0; i<circleNum; i++) {
			var circle = new createjs.Shape();
			var r = 7;
			var x = window.innerWidth*Math.random();
			var y = window.innerHeight*Math.random();
			var color = colors[Math.floor(i%colors.length)];
			var alpha = 0.1 + Math.random()*0.1;
			circle.alpha = alpha;
			circle.radius = r;
			circle.graphics.beginFill(color).drawCircle(0, 0, r);
			circle.x = x;
			circle.y = y;
			circles.push(circle);
			stage.addChild(circle);
			circle.movement = 'float';
			tweenCircle(circle);
		}
	}


	// animating circles
	function animate() {
		stage.update();
		requestAnimationFrame(animate);
	}

	function tweenCircle(c, dir) {
		if(c.tween) c.tween.kill();
		var s = 0.55 + Math.random()*0.1;
		var D = 3;
		if(dir == 'in') {
			c.tween = TweenLite.to(c, 0.3, {x: c.originX + Math.random()*D, y: c.originY + Math.random()*D, ease:Quad.easeInOut, alpha: 0.5 + Math.random()*0.3, radius: 5, scaleX: s, scaleY: s, onComplete: function() {
				c.movement = 'jiggle';
				tweenCircle(c);
			}});
		} else if(dir == 'out') {
			c.tween = TweenLite.to(c, 0.6, {x: window.innerWidth*Math.random(), y: window.innerHeight*Math.random(), ease:Quad.easeInOut, alpha: 0.1 + Math.random()*0.1, scaleX: 1, scaleY: 1, onComplete: function() {
				c.movement = 'float';
				tweenCircle(c);
			}});
		} else {
			if(c.movement == 'float') {
				c.tween = TweenLite.to(c, 5 + Math.random()*3.5, {x: c.x + -100+Math.random()*200, y: c.y + -100+Math.random()*200, ease:Quad.easeInOut, alpha: 0.1 + Math.random()*0.1,
					onComplete: function() {
						tweenCircle(c);
					}});
			} else {
				c.tween = TweenLite.to(c, 2+Math.random()*1, {x: c.originX + Math.random()*D, y: c.originY + Math.random()*D, alpha : 0.5 + Math.random()*0.3, scaleX: s, scaleY: s, ease:Quad.easeInOut,
					onComplete: function() {
						tweenCircle(c);
					}});
			}
		}
	}

	function formText() {
		var tmp = new Array();
		for(var i= 0, l=textPixels.length; i<l; i++){
			tmp.push(i);
		}
		for(var i= 0, l=textPixels.length; i<l; i++){
			var id = Math.floor(Math.random()*i);
			tmp[id]^=tmp[i];
			tmp[i]^=tmp[id];
			tmp[id]^=tmp[i];
		}
		
		for(var i= 0, l=textPixels.length; i<l; i++) {
			circles[i].originX = offsetX + textPixels[tmp[i]].x;
			circles[i].originY = offsetY + textPixels[tmp[i]].y;
			tweenCircle(circles[i], 'in');
		}
		textFormed = true;
		if(textPixels.length < lastLength) {
			for(var j = textPixels.length; j<lastLength; j++) {
				tweenCircle(circles[j], 'out');
			}
		}
		lastLength = textPixels.length;
	}

	function explode() {
		for(var i= 0, l=textPixels.length; i<l; i++) {
			//tweenCircle(circles[i], 'out');
		}
		if(textPixels.length < circles.length) {
			for(var j = textPixels.length; j<circles.length; j++) {
				circles[j].tween = TweenLite.to(circles[j], 0.4, {alpha: 1});
			}
		}
	}

	// event handlers
	function addListeners() {
		form.addEventListener('submit', function(e) {
			e.preventDefault();
			if(textFormed) {
				explode();
				if(input.value != '') {
					setTimeout(function() {
						createText(input.value.toUpperCase());
					}, 0);
				} else {
					textFormed = false;
				}
			} else {
				createText(input.value.toUpperCase());
			}

		});
	}

	function createText(t) {
		var fontSize = 860/(t.length);
		if (fontSize > maxFontSize) fontSize = maxFontSize;
		text.text = t;
		text.font = "900 "+fontSize+"px 'Microsoft Yahei, Source Sans Pro'";
		text.textAlign = 'center';
		text.x = textW/2;
		text.y = (textH-fontSize)/2;
		textStage.addChild(text);
		textStage.update();

		var ctx = document.getElementById('text').getContext('2d');
		var pix = ctx.getImageData(0,0,textW,textH).data;
		textPixels = [];
		var s = 4;
		for (var i = pix.length; i >= 0; i -= s) {
			if (pix[i] != 0) {
				var x = (i / s) % textW;
				var y = Math.floor(Math.floor(i/textW)/s);

				if((x && x%8 == 0) && (y && y%8 == 0)) textPixels.push({x: x, y: y});
			}
		}

		formText();

	}
	function getRandNumber(){
		var x, i, n=list.length;
		if (n >= (numberR - numberL + 1) ){
			return "-1";
		}
		while (true){
			x = (Math.floor(Math.random() * (numberR - numberL + 1)) + numberL).toString();
			while (x.length<4) x="0"+x;
			for (i = 0; i < n; i++){
				if (Number(x) == list[i]) break;
			}
			if (i==n) return x;
		}
	}
	
	//主循环
	function reform(){
		if (flag){
			//如果处于循环滚动状态，则生成一个新的数，并展示
			now = getRandNumber();
			createText(now);
			console.log(now);//调试输出
		}
		var time = setTimeout("reform()", timeSpace);
	}
	function importData() {
		var resultFile = document.getElementById("data").files[0];
		if (resultFile) {
			var reader = new FileReader();

			reader.readAsText(resultFile,'UTF-8');
			reader.onload = function (e) {
				var data = this.result;
				var tmp = JSON.parse(data);
				tmp.forEach(addList);
				document.getElementById("choose").style.display="none";
				document.getElementById("import").style.display="none";
			};
		}
	}
	function exportData(){
		var blob = new Blob([JSON.stringify(list)], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "data.txt");
	}

	window.onload = function() {
		init();
		createText(now);
		var time = setTimeout("reform()", timeSpace);
	};
