const zoomable = (()=>{
	
	class z{
		
		constructor(img, opts={}){
			
			/**
			 * User defined options object
			 */
			this.opts = opts;
			
			/**
			 * Original Image object
			 */
			this.oImg = img;
			
			/**
			 * Image object in it's natural size
			 */
			this.nImg = null;
			
			/**
			 * The source URI of the original image
			 */
			this.src = img.src;
			
			/**
			 * The bounds of the image as it appears on the screen
			 */
			this.oBounds = null;
			
			/**
			 * The div that will replace the original image
			 */
			this.div = null;
			
			/**
			 * The canvas that acts as the magnifying glass
			 */
			this.canvas = null;
			
			/**
			 * The canvas' 2d drawing context
			 */
			this.ctx =  null;
			
			/**
			 * Is the magnifying glass currently showing?
			 */
			this.active = false;
			
			/**
			 * The width of the canvas
			 */
			this.cWidth = null;
			
			/**
			 * The height of the canvas
			 */
			this.cHeight = null;
			
			/**
			 * The original scale of the image as shown on the screen, if any
			 */
			this.scale = null;
			
			this.initZoomable();
		}
		
		initZoomable(){
			this.normalizeOpts();
			this.loadImg().then(()=>{
				this.replaceImg();
				this.getNaturalImg().then(()=>{ 
					this.scale = this.nImg.width/this.oBounds.width;
					this.renderCanvas();
					this.startEventListeners();
				});
			});
		}
		
		startEventListeners(){
			const clearEl = this.opts.trigger == 'mousedown' ? document : this.div;
			const clearEvt = this.opts.trigger == 'mousedown' ? 'mouseup' : 'mouseout';
			this.div.addEventListener(this.opts.trigger, e=>{
				this.active = true;
				document.body.appendChild(this.canvas);
				this.paintCanvas(e);
			});
			this.div.addEventListener('mousemove', e=>{
				if(this.active) this.paintCanvas(e);
			});
			clearEl.addEventListener(clearEvt, e=>{
				if(!this.active) return;
				this.active = false;
				this.canvas.parentNode.removeChild(this.canvas);
			});
		}
		
		renderCanvas(){
			this.canvas = document.createElement('canvas');
			this.canvas.style.width = this.opts.magWidth;
			this.canvas.style.height = this.opts.magHeight;
			this.canvas.style.border = this.opts.magBorder;
			this.canvas.style.borderRadius = this.opts.magBorderRadius;
			this.canvas.style.position = 'absolute';
			this.canvas.style.cursor = "zoom-in";
			this.canvas.style.boxShadow = this.opts.boxShadow;
			this.canvas.style.background = this.opts.background;
			this.ctx = this.canvas.getContext('2d');
		}
		
		paintCanvas(mouseEvt){
			this.canvas.style.top = mouseEvt.clientY+'px';
			this.canvas.style.left = mouseEvt.clientX+'px';
			if(!this.cWidth && ! this.cHeight){
				var cbox = this.canvas.getBoundingClientRect();
				this.cWidth = cbox.width;
				this.canvas.width = cbox.width;
				this.cHeight = cbox.height;
				this.canvas.height = cbox.height;
			}
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
			var halfCanvasWidth = (this.cWidth/2);//*this.scale;
			var halfCanvasHeight = (this.cHeight/2);//*this.scale;
			
			var xpos = mouseEvt.clientX - this.oBounds.left		
			var ypos = mouseEvt.clientY - this.oBounds.top
			var relativeX = xpos * this.scale;
			var relativeY = ypos * this.scale;

			//console.log(this.cWidth, this.cHeight);

			var sx = relativeX, 
				sy = relativeY, 
				sWidth = this.cWidth*this.scale/this.opts.zoomlevel, 
				sHeight = this.cHeight*this.scale/this.opts.zoomlevel, 
				dx = 0, //halfCanvasWidth, 
				dy = 0, //halfCanvasHeight, 
				dWidth = this.cWidth*2,
				dHeight = this.cHeight*2;
				
			this.ctx.drawImage(this.nImg, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
		}
		
		getNaturalImg(){
			return new Promise(done=>{
				this.nImg = new Image();
				this.nImg.src = this.src;
				if(this.nImg.complete) done();
				else this.nImg.onload = ()=>done();
			});
		}
		
		getImgCSS(){
			var styles = getComputedStyle(this.oImg, null);
			var s = [];
			for(let i=styles.length; i--;) 
				s.push(`${styles[i]}:${styles.getPropertyValue(styles[i])};`);
			return s.join('');
		}
		
		replaceImg(){
			this.oBounds = this.oImg.getBoundingClientRect();
			this.div = document.createElement('div');
			this.oImg.parentNode.replaceChild(this.div, this.oImg);
			
			this.div.style.cssText = this.getImgCSS();
			this.div.style.width = this.oBounds.width+"px";
			this.div.style.minWidth = this.oBounds.width+"px";
			this.div.style.maxWidth = this.oBounds.width+"px";
			this.div.style.height = this.oBounds.height+"px";
			this.div.style.minHeight = this.oBounds.height+"px";
			this.div.style.maxHeight = this.oBounds.height+"px";
			this.div.style.overflow = 'hidden';
			this.div.style.background = `url(${this.src})`;
			this.div.style.backgroundRepeat = 'no-repeat';
			this.div.style.backgroundSize = `${this.oBounds.width}px ${this.oBounds.height}px`;
			this.div.style.cursor = "zoom-in";
		}
		
		loadImg(){
			return new Promise(done=>{
				if(this.oImg.complete) return done();
				else this.oImg.addEventListener('load', done);
			});
		}
		
		normalizeOpts(){
			this.opts.trigger = (this.opts.trigger || 'mousedown').toLowerCase();
			if(this.opts.trigger !== 'mousedown') this.opts.trigger = 'mouseover';
			this.opts.magWidth = this.opts.magWidth || "5em";
			this.opts.magHeight = this.opts.magHeight || "5em";
			this.opts.magBorder = this.opts.magBorder || "5px solid white";
			this.opts.magBorderRadius = this.opts.magBorderRadius || "100%";
			this.opts.zoomlevel = this.opts.zoomlevel || 2.5;
			this.opts.boxShadow = this.opts.boxShadow || '0 0 7px 7px rgba(0, 0, 0, 0.25), inset 0 0 40px 2px rgba(0, 0, 0, 0.25)';
			this.opts.background = this.opts.background || 'white';
		}
		
	}
	
	return (img, opts) => { new z(img, opts); };
	
})();