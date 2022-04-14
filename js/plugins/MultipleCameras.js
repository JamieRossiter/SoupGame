//=============================================================================
// MultipleCameras.js
// PUBLIC DOMAIN
// ----------------------------------------------------------------------------
// 2017/02/01 カメラのバックに遠景を設定可能に。マップ遠景がスクロールしないバグを修正
// 2017/02/05 カメラをクリックorタップして移動できるように。一部カメラのタッチ移動禁止機能を追加
// 2017/02/07 アニメーションとフキダシの表示がズレていたので修正
//=============================================================================

/*:
 * @plugindesc Place multiple cameras (viewpoints) on the screen.
 * @author Kuramubon
 *
 * @help
 * A plugin that increases the number of screens and projects multiple locations.
 * Of course, the screen division that is common in competitive games, etc.
 * Extract a part of the remote area you want to pay attention to with a small window, etc.
 * Various effects can be achieved depending on how you use it.
 *
 *
 * Plugin command:
 * Basically, set in the order of (border setting,) camera placement, and target.
 * If you want to use a variable in a command, use \ V [variable number].
 *
 * ・ Camera placement
 * camera set horizontal (or vertical, quarter)
 * Place the camera with the settings prepared in advance.
 * Horizontal: Divided horizontally into two. The top is camera 0 and the bottom is camera 1.
 * Vertical: Divided vertically into two. Camera 0 is on the left and camera 1 is on the right.
 * Quarter: 4 divisions. The upper left is camera 0, the upper right is 1, the lower left is 2, and the lower right is 3.
 * To save drawing, the previously displayed camera and main screen will be erased.
 *
 * camera set camera number top left x coordinate top left y coordinate width height
 * Create a new camera with the specified camera number, position, width and height.
 * Specify the position, width, and height in "mass unit" with the upper left of the screen as (0,0).
 * (If you want to make a halfway value, you can specify it with a decimal number normally)
 * When the cameras overlap, the one with the larger camera number appears in the foreground.
 *
 * If the main screen was deleted with the remove command, use "camera set -1".
 * You can redisplay it, but you cannot change its position or size at this time.
 *
 *
 * ・ Target (target projected by the camera)
 * All cameras tracked immediately after being placed are "players".
 * Use the following two types of target commands to set targets well.
 * Even if you specify "-1" for the camera number, the target on the main screen cannot be changed.
 *
 * camera target camera number xy upper left x coordinate upper left y coordinate
 * Specify the target to be projected by the camera with the specified camera number in fixed coordinates.
 *
 * camera target camera number event event ID
 * Specify the target event to be tracked and projected by the camera with the specified camera number.
 * If you want to scroll the camera, target transparent events.
 * It's nice to walk it in the direction you want to scroll.
 * If "0" is specified for the event ID, the target will be "this event".
 * If "-1" is specified, the target will be "player".
 *
 *
 * ・ Camera border setting
 * camera frame Frame width Frame color
 * Change the settings related to the camera border.
 * The width is a number, and the color is specified by black or white or a color code (example: ff0000).
 * The initial width is 2 and the initial color is black.
 *
 * This command is the setting of the border of "Camera to be created", so
 * Set it before placing the camera.
 * You can also place the camera without a border by setting the width of the border to 0.
 * If you want to make the frame more elaborate, delete the frame and display the picture instead.
 *
 *
 * ・ Erase the camera
 * camera remove camera number
 * Erases the camera with the specified camera number.
 * If "-1" is specified for the camera number, the main screen will be turned off.
 * If you show a useless screen behind the scenes, the game will be heavy.
 * If you don't need the main screen, turn it off.
 *
 *
 * ・ A distant view behind the camera
 * camera parallax back
 * If you use the "Change distant view" command after this plugin command
 * You can view the distant view behind all cameras instead of the distant view of the map.
 * In other words, you can see it only when the main screen is erased and there is a gap in the camera arrangement.
 *
 * camera parallax map
 * Returns the setting destination of the distant view to the map.
 *
 *
 * ・ Camera touch settings
 * camera notouch Camera number A Camera number B ...
 * Even if you click or tap the camera with the specified number (s)
 * Players will not be able to move there.
 * If you include "-1" in the camera number, the main screen cannot be touch-moved.
 * Cameras with numbers not specified here can be touch-moved.
 *
 * If the touchable cameras overlap,
 * The camera that overlaps the top (= camera number is large) is touched.
 * If the upper camera cannot be touched, the lower camera will be touched.
 *
 *
 * ·reset
 * camera reset
 * Cancel all camera placement and return to the state of one main screen.
 *
 *
 * License:
 * There are no restrictions on how to use this plugin. Please do as you like.
 */

(function() {
	'use strict';
	//画面を描画する直前に、各カメラに画像を描画する
	var _Graphics_render = Graphics.render;
	Graphics.render = function(stage) {
		if (this._skipCount === 0 && stage instanceof Scene_Map) {
			stage._spriteset.renderCameras();
		}
		_Graphics_render.apply(this, arguments);
	};

	//スナップショットの直前も同様
	var _Bitmap_snap = Bitmap.snap;
	Bitmap.snap = function(stage) {
		if (stage instanceof Scene_Map) {
			stage._spriteset.renderCameras();
		}
		return _Bitmap_snap.apply(this, arguments);
	};

	//カメラの後ろの遠景と、カメラのコンテナを作る
	var _Spriteset_Map_createBaseSprite = Spriteset_Map.prototype.createBaseSprite;
	Spriteset_Map.prototype.createBaseSprite = function() {
		this._cameraParallax = new TilingSprite();
		this._cameraParallax.move(0, 0, Graphics.width, Graphics.height);
		this.addChild(this._cameraParallax);
		_Spriteset_Map_createBaseSprite.apply(this, arguments);
		// this.createCameraContainer();
	};

	Spriteset_Map.prototype.createCameraContainer = function() {
		this._cameraContainer = new PIXI.Container();
		SceneManager._scene.addChild(this._cameraContainer); // edited by Jamie Rossiter - this adds the camera container to the scene rather than the spriteset.
		// this.addChild(this._cameraContainer);
	};

	//新しいカメラと枠を作る。カメラ同士を重ねるとindexが大きい方が手前になる
	Spriteset_Map.prototype.createNewCamera = function(camera, index) {
		this.createCameraContainer(); // edited by Jamie Rossiter - calling this function here will cause it to be called later on in the stack.
		var tw = $gameMap.tileWidth();
		var th = $gameMap.tileHeight();
		var texture = PIXI.RenderTexture.create(camera.width * tw, camera.height * th); 
		// var texture = PIXI.RenderTexture.create(camera.width, camera.height); // Edited by Jamie Rossiter - remove mapping to tile sizes
		var sprite = new PIXI.Sprite(texture);
		// sprite.x = camera.x * tw; // Edited by Jamie Rossiter - remove mapping to tile sizes
		// sprite.y = camera.y * th; // Edited by Jamie Rossiter - remove mapping to tile sizes
		sprite.x = camera.x + 15; // edited by Jamie Rossiter - add an offset to the camera x coord
		sprite.y = camera.y + 15; // edited by Jamie Rossiter - add an offset to the camera y coord
		if (camera.lineWidth > 0) {
			var lineWidth = camera.lineWidth;
			var lineColor = camera.lineColor;
			var frame = new PIXI.Graphics();
			frame.x = -lineWidth / 2;
			frame.y = -lineWidth / 2;
			frame.lineStyle(lineWidth, lineColor, 1); 
			// frame.drawRect(0, 0, texture.width + lineWidth, texture.height + lineWidth); Edited by Jamie Rossiter - remove border frame
			sprite.addChild(frame);
		}
		this._cameras = this._cameras || [];
		this._cameras[index] = {texture: texture, sprite: sprite};
		for (var i = index - 1; i >= 0; i--) {
			if (this._cameras[i]) {
				i = this._cameraContainer.getChildIndex(this._cameras[i].sprite);
				break;
			}
		}
		this._cameraContainer.addChildAt(sprite, i + 1);
	};

	Spriteset_Map.prototype.createAllCameras = function() {
		if ($gameMap._cameras) {
			$gameMap._cameras.forEach(this.createNewCamera, this);
		}
	};

	Spriteset_Map.prototype.removeCamera = function(index) {
		if (this._cameras && this._cameras[index]) {
			this._cameraContainer.removeChild(this._cameras[index].sprite);
			delete this._cameras[index];
		}
	};

	Spriteset_Map.prototype.removeAllCameras = function() {
		this._cameraContainer.removeChildren();
		delete this._cameras;
	};

	//マップ画面をそれぞれのカメラが映す位置までスクロールした上で、カメラのTextureに描画していく
	Spriteset_Map.prototype.renderCameras = function() {
		if (this._cameras) {
			var displayPos = $gameMap.saveDisplayPos();
			this._baseSprite.visible = true;
			this._cameras.forEach(function(camera, index) {
				$gameMap.scrollDisplayPos(index);
				this.changePositions();
				Graphics._renderer.render(this._baseSprite, camera.texture);
			}, this);
			$gameMap.restoreDisplayPos(displayPos);
			this.changePositions();
		}
		this._baseSprite.visible = !$gameMap._mainCameraDisabled;
	};

	//$gameMapのスクロールをSpritesetに反映させる。これをしないと見た目が変わらない
	Spriteset_Map.prototype.changePositions = function() {
		this.updateParallax();
		this.updateTilemap();
		this._characterSprites.forEach(function(character) {
			character.updatePosition();
			character._animationSprites.forEach(function(animation) {
				animation.updatePosition();
			});
			character.updateBalloon();
		});
		this.updateShadow();
		this._destinationSprite.updatePosition();
	};

	//カメラバック遠景の画像名や位置を反映する
	Spriteset_Map.prototype.updateCameraParallax = function() {
		var parallax = $gameMap._cameraParallax;
		if (parallax) {
			if (this._cameraParallaxName !== parallax.name) {
				this._cameraParallaxName = parallax.name;
				if (this._cameraParallax.bitmap && !Graphics.isWebGL()) {
					var index = this.getChildIndex(this._cameraParallax);
					this.removeChildAt(index);
					this._cameraParallax = new TilingSprite();
					this._cameraParallax.move(0, 0, Graphics.width, Graphics.height);
					this.addChildAt(this._cameraParallax, index);
				}
				this._cameraParallax.bitmap = ImageManager.loadParallax(parallax.name);
			}
			if (this._cameraParallax.bitmap) {
				this._cameraParallax.origin.x = parallax.x;
				this._cameraParallax.origin.y = parallax.y;
			}
		}
	};

	var _Spriteset_Map_update = Spriteset_Map.prototype.update;
	Spriteset_Map.prototype.update = function() {
		_Spriteset_Map_update.apply(this, arguments);
		this.updateCameraParallax();
	};

	//カメラを生成する。マップをまたぐ時やセーブ・ロード時に対応するためこちらから起動する
	//indexに-1を指定すると消えているメイン画面を再表示できる
	Game_Map.prototype.addCamera = function(index, x, y, width, height) {
		if (index === -1) {
			delete this._mainCameraDisabled;
			return;
		}
		this._cameras = this._cameras || [];
		this._cameras[index] = {x: x, y: y, width: width, height: height, target: -1, targetX: 0, targetY: 0};
		this._cameraFrame = this._cameraFrame || {lineWidth: 2, lineColor: 0x000000};
		this._cameras[index].lineWidth = this._cameraFrame.lineWidth;
		this._cameras[index].lineColor = this._cameraFrame.lineColor;
		if (SceneManager._scene instanceof Scene_Map) {
			SceneManager._scene._spriteset.removeCamera(index);
			SceneManager._scene._spriteset.createNewCamera(this._cameras[index], index);
		}
	};

	//カメラを消去する。indexに-1を指定するとメイン画面を非表示にできる
	Game_Map.prototype.removeCamera = function(index) {
		if (index === -1) {
			this._mainCameraDisabled = true;
			return;
		}
		if (this._cameras) {
			delete this._cameras[index];
		}
		if (SceneManager._scene instanceof Scene_Map) {
			SceneManager._scene._spriteset.removeCamera(index);
		}
	};

	Game_Map.prototype.removeAllCameras = function() {
		delete this._mainCameraDisabled;
		delete this._noTouchCameras;
		delete this._cameras;
		if (SceneManager._scene instanceof Scene_Map) {
			SceneManager._scene._spriteset.removeAllCameras();
		}
	};

	//カメラのターゲットを固定の座標(左上)で指定する
	Game_Map.prototype.cameraToXy = function(cameraId, x, y) {
		if (this._cameras && this._cameras[cameraId]) {
			this._cameras[cameraId].target = 0;
			this._cameras[cameraId].targetX = x;
			this._cameras[cameraId].targetY = y;
		}
	};

	//カメラのターゲットに特定のマップイベントを指定する
	Game_Map.prototype.cameraToEvent = function(cameraId, eventId) {
		if (this._cameras && this._cameras[cameraId]) {
			this._cameras[cameraId].target = eventId;
		}
	};

	//カメラのターゲットになっているマップイベントが中央に映るように設定する
	Game_Map.prototype.updateCameras = function() {
		if (this._cameras) {
			this._cameras.forEach(function(camera) {
				var character = camera.target === -1 ? $gamePlayer : $gameMap.event(camera.target);
				if (character) {
					character.centering(camera);
				}
			});
		}
	};

	//画面の位置をカメラがターゲットに指定する位置までスクロールしていく
	Game_Map.prototype.scrollDisplayPos = function(index) {
		var camera = this._cameras[index];
		if (this.isLoopHorizontal()) {
			var x = camera.targetX - this._displayX;
			this._displayX += x.mod(this.width());
			this._parallaxX += x;
		} else {
			var endX = this.width() - camera.width;
			if (endX > 0) {
				var lastX = this._displayX;
				this._displayX = camera.targetX.clamp(0, endX);
				this._parallaxX += this._displayX - lastX;
			}
		}
		if (this.isLoopVertical()) {
			var y = camera.targetY - this._displayY;
			this._displayY += y.mod(this.height());
			this._parallaxY += y;
		} else {
			var endY = this.height() - camera.height;
			if (endY > 0) {
				var lastY = this._displayY;
				this._displayY = camera.targetY.clamp(0, endY);
				this._parallaxY += this._displayY - lastY;
			}
		}
	};

	//画面のスクロール位置の記録と復帰
	Game_Map.prototype.saveDisplayPos = function() {
		return {dx: this._displayX, dy: this._displayY, px: this._parallaxX, py: this._parallaxY};
	};

	Game_Map.prototype.restoreDisplayPos = function(data) {
		this._displayX = data.dx;
		this._displayY = data.dy;
		this._parallaxX = data.px;
		this._parallaxY = data.py;
	};

	//指定したカメラがタッチ移動可能かどうか
	Game_Map.prototype.canTouchCamera = function(index) {
		var canTouch = !this._noTouchCameras || !this._noTouchCameras.contains(index);
		var camera = this._cameras[index];
		if (index === -1) {
			return canTouch && !this._mainCameraDisabled;
		} else if (!camera || !canTouch) {
			return false;
		} else {
			var x = TouchInput.x / this.tileWidth() - camera.x;
			var y = TouchInput.y / this.tileHeight() - camera.y;
			return x >= 0 && y >= 0 && x < camera.width && y < camera.height;
		}
	};

	//タッチ移動可能なカメラから座標を取得する
	var _Game_Map_canvasToMapX = Game_Map.prototype.canvasToMapX;
	Game_Map.prototype.canvasToMapX = function(x) {
		if (!this._cameras) {
			return _Game_Map_canvasToMapX.apply(this, arguments);
		} else {
			for (var i = this._cameras.length - 1; i >= 0; i--) {
				if (this.canTouchCamera(i)) {
					var camera = this._cameras[i];
					var dx = this._displayX;
					var endX = this.width() - camera.width;
					this._displayX = endX < 0 ? endX / 2 : camera.targetX.clamp(0, endX);
					this._displayX -= camera.x;
					var value = _Game_Map_canvasToMapX.apply(this, arguments);
					this._displayX = dx;
					return value;
				}
			}
			if (this.canTouchCamera(-1)) {
				return _Game_Map_canvasToMapX.apply(this, arguments);
			}
			return null;
		}
	};

	var _Game_Map_canvasToMapY = Game_Map.prototype.canvasToMapY;
	Game_Map.prototype.canvasToMapY = function(y) {
		if (!this._cameras) {
			return _Game_Map_canvasToMapY.apply(this, arguments);
		} else {
			for (var i = this._cameras.length - 1; i >= 0; i--) {
				if (this.canTouchCamera(i)) {
					var camera = this._cameras[i];
					var dy = this._displayY;
					var endY = this.height() - camera.height;
					this._displayY = endY < 0 ? endY / 2 : camera.targetY.clamp(0, endY);
					this._displayY -= camera.y;
					var value = _Game_Map_canvasToMapY.apply(this, arguments);
					this._displayY = dy;
					return value;
				}
			}
			if (this.canTouchCamera(-1)) {
				return _Game_Map_canvasToMapY.apply(this, arguments);
			}
			return null;
		}
	};

	//プラグインコマンドで指定されている場合はカメラバック遠景を設定する
	var _Game_Map_changeParallax = Game_Map.prototype.changeParallax;
	Game_Map.prototype.changeParallax = function(name, loopX, loopY, sx, sy) {
		if (this._cameraParallax && !this._cameraParallax.disabled) {
			var s = ImageManager.isZeroParallax(name) ? 2 : 4;
			this._cameraParallax = {name: name, x: 0, y: 0, sx: loopX ? sx / s : 0, sy: loopY ? sy / s : 0};
		} else {
			_Game_Map_changeParallax.apply(this, arguments);
		}
	};

	//カメラバック遠景のスクロール
	var _Game_Map_updateParallax = Game_Map.prototype.updateParallax;
	Game_Map.prototype.updateParallax = function() {
		_Game_Map_updateParallax.apply(this, arguments);
		if (this._cameraParallax) {
			this._cameraParallax.x += this._cameraParallax.sx;
			this._cameraParallax.y += this._cameraParallax.sy;
		}
	};

	//プレイヤーが近くにいないと自律移動が止まってしまう仕様を無効化する
	//カメラに映されていてもプレイヤーが遠ざかると動きが止まるというのは奇妙なので
	Game_CharacterBase.prototype.isNearTheScreen = function() {
		return true;
	};

	//カメラの位置をキャラクターが中央に映るように調節する
	Game_CharacterBase.prototype.centering = function(camera) {
		camera.targetX = this._realX + 0.5 - camera.width / 2;
		// camera.targetY = this._realY + 0.5 - camera.height / 2;
		camera.targetY = this._realY - camera.height / 2; // Edited by Jamie Rossiter - correct centering
	};

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.apply(this, arguments);
		if (command.toLowerCase() === 'camera') {
			args = args.map(function(arg) {
				return arg.replace(/\\V\[(\d+)\]/gi, function() {
					return $gameVariables.value(parseInt(arguments[1]));
				});
			});
			switch (args.shift().toLowerCase()) {
				case 'set':
					this.setCamera.apply(this, args);
					break;
				case 'target':
					this.targetCamera.apply(this, args);
					break;
				case 'remove':
					this.removeCamera.apply(this, args);
					break;
				case 'frame':
					this.frameCamera.apply(this, args);
					break;
				case 'parallax':
					this.parallaxCamera.apply(this, args);
					break;
				case 'notouch':
					this.noTouchCamera(args);
					break;
				case 'reset':
					this.resetCamera();
					break;
				default:
					break;
			}
		}
	};

	//カメラを設定する。quarterなどのオプションは実は手動設定の省略記法でしかない
	Game_Interpreter.prototype.setCamera = function(typeOrIndex, x, y, width, height) {
		switch (typeOrIndex.toLowerCase()) {
			case 'vertical':
				var halfWidth = $gameMap.screenTileX() / 2;
				var fullHeight = $gameMap.screenTileY();
				$gameMap.removeAllCameras();
				$gameMap.removeCamera(-1);
				$gameMap.addCamera(0, 0, 0, halfWidth, fullHeight);
				$gameMap.addCamera(1, halfWidth, 0, halfWidth, fullHeight);
				break;
			case 'horizontal':
				var fullWidth = $gameMap.screenTileX();
				var halfHeight = $gameMap.screenTileY() / 2;
				$gameMap.removeAllCameras();
				$gameMap.removeCamera(-1);
				$gameMap.addCamera(0, 0, 0, fullWidth, halfHeight);
				$gameMap.addCamera(1, 0, halfHeight, fullWidth, halfHeight);
				break;
			case 'quarter':
				var halfWidth = $gameMap.screenTileX() / 2;
				var halfHeight = $gameMap.screenTileY() / 2;
				$gameMap.removeAllCameras();
				$gameMap.removeCamera(-1);
				$gameMap.addCamera(0, 0, 0, halfWidth, halfHeight);
				$gameMap.addCamera(1, halfWidth, 0, halfWidth, halfHeight);
				$gameMap.addCamera(2, 0, halfHeight, halfWidth, halfHeight);
				$gameMap.addCamera(3, halfWidth, halfHeight, halfWidth, halfHeight);
				break;
			default:
				$gameMap.addCamera(+typeOrIndex, +x, +y, +width, +height);
				break;
		}
	};

	Game_Interpreter.prototype.targetCamera = function(index, type, eventIdOrX, y) {
		switch (type.toLowerCase()) {
			case 'xy':
				$gameMap.cameraToXy(+index, +eventIdOrX, +y);
				break;
			case 'event':
				var eventId = +eventIdOrX;
				$gameMap.cameraToEvent(+index, eventId === 0 ? this._eventId : eventId);
				break;
			default:
				break;
		}
	};

	Game_Interpreter.prototype.removeCamera = function(index) {
		$gameMap.removeCamera(+index);
	};

	//カメラ枠の幅と色を設定する。blackとwhiteは特別扱いで、他の色はff0000などのカラーコードで指定する
	Game_Interpreter.prototype.frameCamera = function(lineWidth, lineColor) {
		lineWidth = +lineWidth;
		switch (lineColor.toLowerCase()) {
			case 'black':
				lineColor = 0x000000;
				break;
			case 'white':
				lineColor = 0xffffff;
				break;
			default:
				lineColor = lineColor[0] === '#' ? lineColor.slice(1) : lineColor;
				lineColor = parseInt(lineColor, 16);
				break;
		}
		$gameMap._cameraFrame = {lineWidth: lineWidth, lineColor: lineColor};
	};

	Game_Interpreter.prototype.parallaxCamera = function(mode) {
		$gameMap._cameraParallax = $gameMap._cameraParallax || {};
		$gameMap._cameraParallax.disabled = mode !== 'back';
	};

	Game_Interpreter.prototype.noTouchCamera = function(idList) {
		$gameMap._noTouchCameras = idList.map(function(id) {
			return +id;
		}).filter(function(id) {
			return !isNaN(id);
		});
	};

	Game_Interpreter.prototype.resetCamera = function() {
		$gameMap.removeAllCameras();
	};

	//マップスタート時に$gameMapに登録されたすべてのカメラを再配置する
	var _Scene_Map_start = Scene_Map.prototype.start;
	Scene_Map.prototype.start = function() {
		_Scene_Map_start.apply(this, arguments);
		this._spriteset.createAllCameras();
	};

	//各カメラのターゲット設定
	var _Scene_Map_update = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() {
		_Scene_Map_update.apply(this, arguments);
		$gameMap.updateCameras();
	};
})();