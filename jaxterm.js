Ajax.PeriodicalRequester = Class.create(Ajax.Base, {
  initialize: function($super, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.url = url;

    this.start();
  },
  
  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Request(this.url, this.options);
  }
});

Terminal = Class.create({  
  initialize: function(screen) {
    this.cursor = '█';
    this.x = 0;
    this.y = 0;
    this.screenWidth = 80;
    this.screenHeight = 40;
    this.matrix = [];
    this.canScroll = true;
    
    this.screen = $(screen);
    this.matrixTable = document.createElement('table');
    this.screen.appendChild(this.matrixTable);
    this.pe = false;
    this.escMode = 0;
    this.redraw();
    //this.initCursor();
    this.moveCursor();
    this.setupInput();
    this.setupOutput();
    this.openConnection('jaxterm.py');
  },
  
  setupInput: function() {
    eval('this.screen.onkeypress = this.onkeypress');
  },
  
  setupOutput: function() {
  },
  
  onkeypress: function(e) {
    //this.put(e.which);
    console.log(e.which);
    eval('t.put(String.fromCharCode(e.which))');
  },
    
  resize: function(newWidth, newHeight) {
    if (typeof(newWidth) != 'undefined' && newWidth > 0) this.screenWidth = newWidth;
    if (typeof(newHeight) != 'undefined' && newHeight > 0) this.screenHeight = newHeight;
    this.redraw();
  },
  
  redraw: function() {  
    this.matrix = (this.matrix || Array()).slice(0, this.screenHeight);
    for (var row=0; row < this.screenHeight; row++) {
      thisRow = this.matrixTable.rows[row] || this.matrixTable.insertRow(row);
      this.matrix[row] = (this.matrix[row] || Array()).slice(0, this.screenWidth);
      //for (var col=0; col < this.screenWidth; col++)
      //  this.matrix[row][col] = this.matrix[row][col] || thisRow.insertCell(col);
      for (var col=0; col < this.screenWidth; col++)
        if (!this.matrix[row][col]) {
          this.matrix[row][col] = thisRow.insertCell(col);
          this.matrix[row][col].innerHTML = '&nbsp;';
        }
        //this.matrix[row][col] =  || 
      for (var col=this.screenWidth; col < thisRow.cells.length; col++)
        thisRow.deleteCell(this.screenWidth);
    }
    for (var row=this.screenHeight; row < this.matrixTable.rows.length; row++)
      this.matrixTable.deleteRow(this.screenHeight);
  },
  
  pos = function(relX, relY, absX, absY) {
    if (typeof(relX) == 'object') {
      absX = relX[0];
      absY = relX[1];
      relX = relY = 0;
    }
    
    this.x = typeof(absX) == 'number' ? absX : this.x;
    this.y = typeof(absY) == 'number' ? absY : this.y;
    if (typeof(relX) == 'number') this.x += relX;
    if (typeof(relY) == 'number') this.x += relY;

    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x > this.screenWidth) this.x = this.screenWidth - 1;
    if (this.y > this.screenHeight) this.y = this.screenHeight - 1;
  },
  
  put: function(text) {
    for (var i=0; i < text.length; i++)
      this.putChar(text[i]);
  },
    
  putChar: function(c) {
    isNormalChar = this.putCharAt(c[0], this.x, this.y);
    if (isNormalChar && ++this.x >= this.screenWidth) this.crlf();
    this.moveCursor();
  },
  
  putCharAt: function(c, x, y) {
    if (typeof(c) == 'string') c = c.charCodeAt(0);
    
    if (this.escMode) return this.putEscChar(c);
    else if (f = this.specialChars[c]) return f(this);
    else this.matrix[y][x].innerHTML = String.fromCharCode(c==32 ? ' ' : c);
    return true;
  },
  
  scrollDown: function() {
    //console.log('scrollDown');
    if (!this.canScroll) return this.x = this.y = 0;
    
    row = this.screenHeight;
    //console.log('this.screenHeight: ' + row + ' this.matrix.length ' + this.matrix.length);
    this.matrix[row] = Array();
    thisRow = this.matrixTable.insertRow(row);
    for (var col=0; col < this.screenWidth; col++) {
      this.matrix[row][col] = thisRow.insertCell(col);
      this.matrix[row][col].innerHTML = '&nbsp;';
    }
    this.matrix.shift();
    this.matrixTable.deleteRow(0);
    this.y--;
    //console.log('(x,y)=('+this.x+','+this.y+') this.matrix.length ' + this.matrix.length);
  },
      
  crlf: function() {
    for (var col=this.x; col < this.screenWidth; col++)
      this.matrix[this.y][col].innerHTML = '&nbsp;';
    this.x = 0; ++this.y;
    if (this.y >= this.screenHeight) this.scrollDown();
  },
  
  cls: function() {
    this.x = 0;
    this.y = 0;
  },
  
  initCursor: function() {
    this.cursorDiv = document.createElement('div');
    this.cursorDiv.id = 'cursor';
    this.cursorDiv.innerHTML = this.cursor;
    this.cursorDiv.style.position = 'absolute';
    this.screen.appendChild(this.cursorDiv);
    
    this.moveCursor();
  },
  
  //getCursorToggler: function(self) { return function() { self.cursorDiv.toggle() } },
  getCursorToggler: function(self) { return function() {
    self.cursorCell = self.matrix[self.y][self.x];
    if (self.cursorCell.style.backgroundColor == 'black')
      self.cursorCell.style.backgroundColor = 'green';
    else
      self.cursorCell.style.backgroundColor = 'black';
  } },
  
  moveCursor: function() {
    /*cellPos = getElementAbsolutePos(this.matrix[this.y][this.x]);
    this.cursorDiv.style.top = cellPos[1]+'px';
    this.cursorDiv.style.left = cellPos[0]+'px'; */
    //this.cursorDiv.show();
    if (self.cursorCell) self.cursorCell.style.backgroundColor = 'black';
    self.cursorCell = this.matrix[this.y][this.x];
    self.cursorCell.style.backgroundColor = 'green';
    if (this.pe) this.pe.stop();
    eval('this.pe = new PeriodicalExecuter(this.getCursorToggler(this), 0.5);');
  },
  
  bksp: function() {
    this.matrix[this.y][this.x].innerHTML = '&nbsp;'
    if (--this.x < 0) { this.y--; this.x = this.screenWidth-1; }
    if (this.y < 0) { this.x = 0; this.y = 0; }
  },
  
  enterEscMode: function() {
    this.escMode = 1;
  },
  
  putEscChar: function(c) {
    if (this.escMode == 1) {
      this.escBuffer = '';
      if (c != 0133) this.escMode = 0; // '['
      else this.escMode = 2;
      return;
    }
    if (c >= 060 && c <= 073 && c != 072) // 0-9, ;
      this.escBuffer = this.escBuffer + String.fromCharCode(c);
    else {
      command = String.fromCharCode(c);
      params = this.escBuffer.split(';');
      if (f = escCommands[command]) f(params[0], params[1], params[2], params[3]);
    }
  },
  
  cCUU: function(n) { this.pos(0, -n || -1); },
  cCUD: function(n) { this.pos(0, n || 1); },
  cCUF: function(n) { this.pos(n || 1); },
  cCUD: function(n) { this.pos(-n || -1); },
  cCNL: function(n) { this.pos(null, -n, 0); },
  cCPL: function(n) { this.pos(null, n, 0); },
  cCHA: function(n) { this.pos([null, n-1]); },
  cCUP: function(row, col) { this.pos([col-1, row-1]); },
  cCED: function(n) {  },
  cCEL: function(n) {  },
  cCSU: function(n) {  },
  cCSD: function(n) {  },

  cSGR: function(code, m) {
    if (code == 0)
      this.bgColor = this.fgColor = this.intensity = this.underline = this.italic = this.blink = null;
    else if (code == 1)
      this.intensity = 1;
    else if (code >= 30 && code <= 39)
      this.fgColor = colorTable[code - 30];
    else if (code >= 40 && code <= 49)
      this.bgColor = colorTable[code - 40];
    else if (code >= 90 && code <= 99)
      this.fgColor = colorTable[code - 90]; // XXX: These are supposed to be intense colors
    else if (code >= 100 && code <= 109)
      this.bgColor = colorTable[code - 100];
  },
  
  colorTable: {
    1:'black', 2:'red', 3:'green', 4:'yellow', 5:'blue', 6:'magenta', 7:'cyan', 8:'white'
  },

  escCommands: {
    'A': this.cCUU.bind(this),
    'B': this.cCUD.bind(this),
    'C': this.cCUF.bind(this),
    'D': this.cCUB.bind(this),
    'E': this.cCNL.bind(this),
    'F': this.cCPL.bind(this),
    'G': this.cCHA.bind(this),
    'H': this.cCUP.bind(this),
    'J': this.cED.bind(this),
    'K': this.cEL.bind(this),
    'S': this.cSU.bind(this),
    'T': this.cSD.bind(this),
    'f': this.cCUP.bind(this),
    'm': this.cSGR.bind(this),
  
  specialChars: {
    010: this.bksp.bind(this),
    012: this.crlf.bind(this),
    015: this.crlf.bind(this),
    033: this.enterEscMode.bind(this)
  },
  
  personalities: {},

  putTransport: function(transport) {
    this.cls();
    this.put(transport.responseText);
  },

  openConnection: function(url) {
    new Ajax.PeriodicalRequester(url, {
      onSuccess: this.putTransport.bind(this),
      onFailure: function(transport) { console.log(transport.status); },
      frequency: 10,
      decay: 2
    });
  }

})

var __isFireFox = navigator.userAgent.match(/gecko/i);

function getElementAbsolutePos(element) {
	x = 0; y = 0;
	if (typeof(element) != 'undefined' && element !== null) {
		x = element.offsetLeft; 
		y = element.offsetTop; 
    	
		var offsetParent = element.offsetParent;
		var parentNode = element.parentNode;

		while (offsetParent !== null) {
			x += offsetParent.offsetLeft;
			y += offsetParent.offsetTop;

			if (offsetParent != document.body && offsetParent != document.documentElement) {
				x -= offsetParent.scrollLeft;
				y -= offsetParent.scrollTop;
			}
			//next lines are necessary to support FireFox problem with offsetParent
			if (__isFireFox) {
				while (offsetParent != parentNode && parentNode !== null) {
					x -= parentNode.scrollLeft;
					y -= parentNode.scrollTop;
					
					parentNode = parentNode.parentNode;
				}    
			}
			parentNode = offsetParent.parentNode;
			offsetParent = offsetParent.offsetParent;
		}
	}
  return [x,y];
}