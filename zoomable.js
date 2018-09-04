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
			
			/**
			 * The z-index of the magnifying glass
			 */
			this.canvasZIndex = null;
			
			this.initZoomable();
		}
		
		initZoomable(){
			this.canvasZIndex = this.getGreatestZIndex()+1;
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
			addEventListener('resize', e=>{
				this.oBounds = this.oImg.getBoundingClientRect();
			});
		}
		
		renderCanvas(){
			this.canvas = document.createElement('canvas');
			this.canvas.style.zIndex = this.canvasZIndex;
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
		
		getGreatestZIndex() {
			var idx = 1, s;
			var sheets = Array.from(document.styleSheets);
			for (let i = sheets.length; i--; ) {
				let rules = Array.from(sheets[i].cssRules || sheets[i].rules);
				for (let n = rules.length; n--; ) {
					if (!(rules[n] instanceof CSSStyleRule)) continue;
					s = rules[n].style.getPropertyValue('z-index');
					if (s > idx) idx = parseInt(s);
				}
			}
			var eles = Array.from(document.querySelectorAll('*'));
			for (let i = eles.length; i--; ) {
				s = eles[i].style.getPropertyValue('z-index');
				if (s > idx) idx = parseInt(s);
			}
			return idx;
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
			this.ctx.drawImage(
				this.nImg, 
				(mouseEvt.clientX - this.oBounds.left) * this.scale, 
				(mouseEvt.clientY - this.oBounds.top) * this.scale, 
				this.cWidth*this.scale/this.opts.zoomlevel, 
				this.cHeight*this.scale/this.opts.zoomlevel, 
				0, 
				0, 
				this.cWidth*2, 
				this.cHeight*2
			);
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
			var styles = this.getImgCSS();
			this.oBounds = this.oImg.getBoundingClientRect();
			this.div = document.createElement('div');			
			this.div.style.cssText = styles;
			this.div.style.width = this.oBounds.width+"px";
			this.div.style.height = this.oBounds.height+"px";
			this.div.style.overflow = 'hidden';
			this.div.style.background = `url(${this.src})`;
			this.div.style.backgroundRepeat = 'no-repeat';
			this.div.style.backgroundSize = 'contain';
			this.div.style.cursor = "zoom-in";
			this.oImg.parentNode.replaceChild(this.div, this.oImg);
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