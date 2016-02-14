//=============================================================================
// MrTS_InvisibleEventsInRange.js
//=============================================================================

/*:
* @plugindesc Makes events invisible when within or outside the range.
* @author Mr. Trivel
*
* @param Appear Gradually
* @desc Should events fade in/out or just pop up/down. True/False
* Default: True
* @default true
*
* @param Appear Time
* @desc If events appear gradually. How long does it take in frames?
* Default: 20
* @default 20
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
* Event Comment Commands
* -------------------------------------------------------------------------------- 
* - If tag is in comment, it'll display according to event's page.
* Use "Comment..." command under Flow Control for those tags.
*
* <Hidden: [TYPE] [RANGE]>
* TYPE - in/out, if "in" - enemy will be hidden if player is within the RANGE.
*                if "out" - enemy will be hidden if player is out of the RANGE.
*
* RANGE - how far/close has player to be
* 
* E.g.
* <Hidden: out 5>
* <Hidden: in 3>
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_InvisibleEventsInRange');
	var paramAppearGradually = String(parameters['Appear Gradually'] || "true").toLowerCase() === "true";
	var paramAppearTime = Number(parameters['Appear Time'] || 20);

	var regexEventHidden = /<hidden:[ ]*(\S+)[ ]+(\d+)>/i;

	var _GameEvent_initialize = Game_Event.prototype.initialize;
	Game_Event.prototype.initialize = function(mapId, eventId) {
		this._isVisible = true;
		this._hiddenMechanicOn = false;
		this._hiddenRange = 0;
		this._hiddenType = "out";
		this._hiddenOpacity = 255.0;
		_GameEvent_initialize.call(this, mapId, eventId);
		this.updateHiddenData();
	};

	Game_Event.prototype.updateHiddenData = function() {
		this._hiddenPageIndex = this._pageIndex;
		if (!this.page()) return;

		var isVisible = true;
		var mechanicOn = false;

		if (this.list())
		{
			for (action of this.list())
			{	
				if (action.code == "108") {
					var a = action.parameters[0];
					var match = regexEventHidden.exec(a);
					if (match)
					{
						this._hiddenType = match[1].toLowerCase();
						this._hiddenRange = Number(match[2]);
						mechanicOn = true;
					}
				}
			}
			
		}

		this._isVisible = isVisible;
		this._hiddenMechanicOn = mechanicOn;
	};

	var _GameEvent_update = Game_Event.prototype.update;
	Game_Event.prototype.update = function() {
		_GameEvent_update.call(this);
		if (this._pageIndex !== this._hiddenPageIndex)
			this.updateHiddenData();

		this.updateHidden();
	};

	Game_Event.prototype.updateHidden = function() {
		var x = $gamePlayer.x;
		var y = $gamePlayer.y;
		var range = Math.abs($gamePlayer.x - this.x) + Math.abs($gamePlayer.y - this.y);
		var withinRange = this._hiddenType === "out" ? 
							range >= this._hiddenRange:
							range <= this._hiddenRange;
		
		this._isVisible = (!this._hiddenMechanicOn || !withinRange);

		if (this._isVisible && this._opacity !== 255)
		{
			if (paramAppearGradually)
				this._hiddenOpacity += 255/paramAppearTime;
			else
				this._hiddenOpacity = 255;

			this._hiddenOpacity = Math.min(this._hiddenOpacity, 255);
			this._opacity = Math.floor(this._hiddenOpacity);
		}
		else if (!this._isVisible && this._opacity !== 0)
		{
			if (paramAppearGradually)
				this._hiddenOpacity -= 255/paramAppearTime;
			else
				this._hiddenOpacity = 0;

			this._hiddenOpacity = Math.max(this._hiddenOpacity, 0);
			this._opacity = Math.floor(this._hiddenOpacity);
		}
	};
})();
