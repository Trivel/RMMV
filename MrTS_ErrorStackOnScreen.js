//=============================================================================
// MrTS_ErrorStackOnScreen.js
//=============================================================================

/*:
* @plugindesc Shows whole error stack on screen for easier reporting.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	SceneManager.catchException = function(e) {
	    if (e instanceof Error) {
	        Graphics.printError(e.name, e.message, e.stack);
	        console.error(e.stack);
	    } else {
	        Graphics.printError('UnknownError', e);
	    }
	    AudioManager.stopAll();
	    this.stop();
	};

	Graphics.printError = function(name, message, stack) {
		stack = this.changeErrorStack(stack);
	    if (this._errorPrinter) {
	        this._errorPrinter.innerHTML = this._makeErrorHtml(name, message, stack);
	    }
	    this._applyCanvasFilter();
	    this._clearUpperCanvas();
	};

	Graphics._makeErrorHtml = function(name, message, stack) {
		var ret = '';
		for (var i = 1; i < stack.length; i++) {
			ret += '<font color=white>' + stack[i] + '</font><br>';
		}
	    return ('<font color="yellow"><b>' + stack[0] + '</b></font><br>' + ret);
	};

	Graphics.changeErrorStack = function(stack)  {
		var lines = stack.split(/(?:\r\n|\r|\n)/);
		for (var i = 1; i < lines.length; i++) {
			lines[i] = lines[i].replace(/[\(](.*[\/])/, '(');
		}
		return lines;
	};

	Graphics._updateErrorPrinter = function() {
	    this._errorPrinter.width = this._width * 0.9;
	    this._errorPrinter.height = this._height * 0.9;
	    this._errorPrinter.style.textAlign = 'left';
	    this._errorPrinter.style.textShadow = '1px 1px 3px #000';
	    this._errorPrinter.style.fontSize = '20px';
	    this._errorPrinter.style.zIndex = 99;
	    this._centerElement(this._errorPrinter);
	};
})();
