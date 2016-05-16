//=============================================================================
// MrTS_MenuMusic.js
//=============================================================================

/*:
* @plugindesc Plays different music in menus.
* @author Mr. Trivel
*
* @param Menu Music
* @desc BGM name for Menu music.
* Default: Ship1
* @default Ship1
*
* @param Shop Music
* @desc BGM name for Shop music.
* Default: Town2
* @default Town2
*
* @param Restart Music
* @desc Restarted or resume music when exiting scenes? Restart/Resume
* Default: Resume
* @default Resume
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
* About the Plugin
* --------------------------------------------------------------------------------
* Don't want default map music playing in Menu? Shop? Crafting menu? This plugin
* allows to change their music to something you'd like instead. Maybe some calming
* music for menu so players can relax from a difficult dungeon or something
* uplifting for shopping.
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Custom Scene Music Setup
* --------------------------------------------------------------------------------
* Music for custom scenes (added by other plugins) will require editing the code.
* Open up this plugin in your favorite text editor and scroll down to: *EDIT HERE*
* It has a couple sample entries to look at.
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_MenuMusic');
	var paramMenuMusic = String(parameters['Menu Music'] || "Ship1");
	var paramShopMusic = String(parameters['Shop Music'] || "Town2");
	var paramRestartMusic = String(parameters['Restart Music'] || "Resume").toLowerCase();

	var musicList = {
	/* --------------------------------------------------------------------------------
	 * -------- EDIT HERE v
	 * -------------------------------------------------------------------------------- */
	 	//Scene name: "BGM Name in quotes",
	 	
	 	// Scene_Save: "Dungeon1",
	 	// Scene_Load: "Dungeon1",
	 /* --------------------------------------------------------------------------------
	 * -------- EDIT THERE ^
	 * -------------------------------------------------------------------------------- */
		Scene_Menu: paramMenuMusic,
		Scene_Shop: paramShopMusic
	};
	
	var _Scene_Base_initialize = Scene_Base.prototype.initialize;
	Scene_Base.prototype.initialize = function() {
		_Scene_Base_initialize.call(this);
		for (var key in musicList) {
			if (musicList.hasOwnProperty(key)) {
				if (this.constructor === eval(key)) 
				{
					this._musicListKey = key;
					var bgm = {
						name: musicList[this._musicListKey],
						pan: 0,
						pitch: 100,
						volume: 90
					};
					if (!AudioManager.isCurrentBgm(bgm)) {
						
						AudioManager.saveMenuBgm(key, AudioManager.saveBgm());
						AudioManager.saveMenuBgs(key, AudioManager.saveBgs());
						AudioManager.playBgm(bgm);
					}					
					break;
				}
			}
		}
	};

	var _Scene_Base_popScene = Scene_Base.prototype.popScene;
	Scene_Base.prototype.popScene = function() {

		if (this._musicListKey)
		{
			AudioManager.replayMenuBgmBgs(this._musicListKey);
		}
		_Scene_Base_popScene.call(this);
	};

	AudioManager.saveMenuBgm = function(key, bgm) {
		if (!this._savedMenuBgm) this._savedMenuBgm = {};
		this._savedMenuBgm[key] = bgm;
	};

	AudioManager.saveMenuBgs = function(key, bgs) {
		if (!this._savedMenuBgs) this._savedMenuBgs = {};
		this._savedMenuBgs[key] = bgs;
	};

	AudioManager.replayMenuBgmBgs = function(key) {
		if (!this._savedMenuBgs) this._savedMenuBgs = {};
		if (!this._savedMenuBgm) this._savedMenuBgm = {};		
		if (this._savedMenuBgs[key]) AudioManager.playBgs(this._savedMenuBgs[key], paramRestartMusic === "resume" ? this._savedMenuBgs[key].pos : 0);
		if (this._savedMenuBgm[key]) AudioManager.playBgm(this._savedMenuBgm[key], paramRestartMusic === "resume" ? this._savedMenuBgm[key].pos : 0);
		else AudioManager.stopBgm();
	};
})();
