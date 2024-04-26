import Vector2 from '../util/Vector2.js';
import TileMap from '../world/tile/TileMap.js';
import ItemStackEntity from '../world/item/ItemStackEntity.js';

/**
 * @typedef {import('../util/Vector2.js').Vector2} Vector2
 * @typedef {import('./Canvas.js').default} Canvas
 * @typedef {import('../world/World.js').default} World
 * @typedef {import('../world/player/Player.js').default} Player
 * @typedef {import('../world/tile/Tile.js').default} Tile
 * @typedef {import('../world/tile/TileEntity.js').default} TileEntity
 * 
 * @typedef {import('../world/player/Player.js').PlayerHealthStatistic} PlayerHealthStatistic
 * @typedef {import('../world/player/Player.js').PlayerStaminaStatistic} PlayerStaminaStatistic
 * @typedef {import('../world/player/Player.js').PlayerHungerStatistic} PlayerHungerStatistic
 * 
 * @typedef {{ buffer: HTMLCanvasElement, ctx: CanvasRenderingContext2D }} RenderBuffer
 * 
 * @typedef {{ min: number, max: number }} ZoomRange
 * @typedef {{ current: number, range: ZoomRange, sensitivity: number, target: number }} ZoomSettings
 * @typedef {{ position: Vector2, scale: Vector2, cache: HTMLCanvasElement, cachectx: CanvasRenderingContext2D, invalid: boolean, info: { verticalSpacing: number, padding: Vector2 } }} MinimapSettings
 * @typedef {{ padding: Vector2, iconsPerRow: number, scale: number, cache: HTMLCanvasElement, cachectx: CanvasRenderingContext2D, invalid: boolean }} PlayerStatisticSettings
 * @typedef {{ slotSize: number, slotScale: number, inventory: RenderBuffer, crafting: RenderBuffer, invalid: boolean, visible: boolean, info: { padding: Vector2 } }} PlayerInventorySettings
 */

/**
 * @class
 */
class Renderer {

    static ZoomSpeed = 0.1;

    /**
     * @static
     * @param {number} currentZoom 
     * @param {ZoomRange} zoomRange 
     * @param {number} sensitivity 
     * @returns {ZoomSettings}
     */
    static ZoomSettings = (currentZoom=1, zoomRange={ min: 0.5, max: 6 }, sensitivity=0.005) => {
        return {
            current: currentZoom,
            range: zoomRange,
            sensitivity: sensitivity,
            target: currentZoom
        };
    };

    /**
     * @param {Vector2} position 
     * @param {Vector2} scale 
     * @returns {MinimapSettings}
     */
    static MinimapSettings = (position=Vector2(32, 32), scale=Vector2(1.5,1.5)) => {
        const cache = document.createElement('canvas');
        return {
            position: position,
            scale: scale,
            size: Vector2(0, 0),
            cache: cache,
            cachectx: cache.getContext('2d'),
            invalid: true,
            info: {
                verticalSpacing: 16,
                padding: Vector2(5, 3)
            }
        };
    };

    /**
     * @param {number} scale
     * @param {Vector2} padding
     * @param {number} iconsPerRow
     * @returns {PlayerStatisticSettings}
     */
    static PlayerStatisticSettings = (scale=0.5, padding=Vector2(10, 10), iconsPerRow=5) => {
        const cache = document.createElement('canvas');
        return {
            padding: padding,
            scale: scale,
            iconsPerRow: iconsPerRow,
            cache: cache,
            cachectx: cache.getContext('2d'),
            invalid: true
        };
    };

    /**
     * @param {number} slotSize 
     * @param {number} slotScale
     * @param {Vector2} padding 
     * @returns {PlayerInventorySettings}
     */
    static PlayerInventorySettings = (slotSize=1, slotScale=0.5, padding=Vector2(10, 10)) => {
        const inventoryCache = document.createElement('canvas');
        const craftingCache = document.createElement('canvas');
        return {
            slotSize: slotSize,
            slotScale: slotScale,
            inventory: {
                buffer: inventoryCache,
                ctx: inventoryCache.getContext('2d')
            },
            crafting: {
                buffer: craftingCache,
                ctx: craftingCache.getContext('2d')
            },
            invalid: true,
            visible: false,
            info: { padding: padding }
        };
    };

    /**
     * @readonly
     * @type {number}
     */
    static TileSize = 64;

    /**
     * @type {Canvas}
     */
    canvas = null;

    /**
     * @type {TileMap}
     */
    tilemap = null;

    /**
     * @type {World}
     */
    world = null;

    /**
     * @type {Player}
     */
    player = null;
    
    /**
     * @type {ZoomSettings}
     */
    zoom = Renderer.ZoomSettings();

    /**
     * @type {MinimapSettings}
     */
    minimap = Renderer.MinimapSettings();

    /**
     * @type {PlayerStatisticSettings}
     */
    playerStatistics = Renderer.PlayerStatisticSettings();

    /**
     * @type {PlayerInventorySettings}
     */
    playerInventory = Renderer.PlayerInventorySettings();

    /**
     * @private
     * @type {{ invalid: boolean, range: { min: number, max: number }, data: { n: Array<{ tile: Tile, position: Vector2 }> } }}
     */
    layerCache = { invalid: true, range: { min: 0, max: 0 }, data: {} };

    /**
     * @private
     * @type {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }}
     */
    _buffer = { canvas: null, ctx: null };

    /**
     * @type {{ position: Vector2, inInventory: boolean, inInventoryCraftingGrid: boolean }}
     */
    mouse = { position: Vector2(0, 0), inInventory: false, inInventoryCraftingGrid: false };

    /**
     * @private
     * @type {number}
     */
    _frameSampleTimeElapsed = 0;

    /**
     * @private
     * @type {number}
     */
    _frameSampleTime = 32;

    /**
     * @private
     * @type {number}
     */
    _frameTime = 0;

    /**
     * @param {Canvas} canvas
     * @param {TileMap} tilemap
     * @param {World} world 
     * @param {Player} player 
     * @param {ZoomSettings} zoomSettings
     * @param {MinimapSettings} minimapSettings
     * @param {PlayerStatisticSettings} playerStatisticSettings
     * @param {PlayerInventorySettings} playerInventorySettings
     */
    constructor(canvas, tilemap, world, player, 
        zoomSettings=Renderer.ZoomSettings(), 
        minimapSettings=Renderer.MinimapSettings(), 
        playerStatisticSettings=Renderer.PlayerStatisticSettings(),
        playerInventorySettings=Renderer.PlayerInventorySettings()
    ) {
        this.canvas = canvas;
        this.tilemap = tilemap;
        this.world = world;
        this.player = player;
        this.zoom = zoomSettings;
        this.minimap = minimapSettings;
        this.playerStatistics = playerStatisticSettings;
        this.playerInventory = playerInventorySettings;

        const buf = document.createElement('canvas');
        this._buffer = {
            canvas: buf,
            ctx: buf.getContext('2d')
        };
    }

    /**
     * @returns {void}
     */
    update() {
        if (Math.abs(this.zoom.current - this.zoom.target) < Renderer.ZoomSpeed) this.zoom.current = this.zoom.target;
        else {
            if (this.zoom.current < this.zoom.target) this.zoom.current += Renderer.ZoomSpeed;
            else this.zoom.current -= Renderer.ZoomSpeed;
        }
        if (this.layerCache.invalid) this._updateLayerCache();
        if (this.minimap.invalid) this._updateMinimapCache();
        if (this.playerStatistics.invalid) this._updatePlayerStatisticCache();
        if (this.playerInventory.invalid) this._updatePlayerInventoryCache();
    }

    /**
     * @private
     * @returns {void}
     */
    _updateLayerCache() {
        this.layerCache.data = [];
        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                const tile = this.world.get(Vector2(x, y));
                if (this.layerCache.data[tile.layer]) this.layerCache.data[tile.layer].push({ tile: tile, position: { x: x, y: y } });
                else this.layerCache.data[tile.layer] = [{ tile: tile, position: { x: x, y: y } }];
                if (tile.entity !== null) {
                    if (this.layerCache.data[tile.entity.layer]) this.layerCache.data[tile.entity.layer].push({ tile: tile.entity, position: { x: x, y: y } });
                    else this.layerCache.data[tile.entity.layer] = [{ tile: tile.entity, position: { x: x, y: y } }];
                }
            }
        }
        if (!this.layerCache.data[0]) this.layerCache.data[0] = []; // ensure player layer
        const keys = Object.keys(this.layerCache.data).map(s => parseInt(s));
        this.layerCache.range = {
            min: Math.min(...keys),
            max: Math.max(...keys)
        };

        this.layerCache.invalid = false;
    }

    /**
     * @private
     * @returns {void}
     */
    _updateMinimapCache() {
        this.minimap.size = { x: Math.floor(this.world.width * this.minimap.scale.x), y: Math.floor(this.world.height * this.minimap.scale.y) };
        this.minimap.cache.width = this.minimap.size.x;
        this.minimap.cache.height = this.minimap.size.y;
        const minimapImg = new ImageData(this.minimap.size.x, this.minimap.size.y);
        for (let i = this.layerCache.range.min; i <= this.layerCache.range.max; i++) {
            if (i === 0) continue;
            else {
                const layer = this.layerCache.data[i];
                for (const { tile, position } of layer) {
                    const start = {
                        x: position.x * this.minimap.scale.x,
                        y: position.y * this.minimap.scale.y
                    };
                    const end = {
                        x: start.x + this.minimap.scale.x,
                        y: start.y + this.minimap.scale.y
                    };
                    const color = this.tilemap.getColor(tile.id);

                    for (let y = start.y; y < end.y; y++) {
                        for (let x = start.x; x < end.x; x++) {
                            const i = (Math.round(y) * this.minimap.size.x + Math.round(x)) * 4;
                            minimapImg.data[i  ] = color[0];
                            minimapImg.data[i+1] = color[1];
                            minimapImg.data[i+2] = color[2];
                            minimapImg.data[i+3] = color[3];
                        }
                    }
                }
            }
        }

        this.minimap.cachectx.putImageData(minimapImg, 0, 0);
        this.minimap.invalid = false;
    }

    /**
     * @private
     * @returns {void}
     */
    _updatePlayerStatisticCache() {
        const playerStatIconSize = Renderer.TileSize * this.playerStatistics.scale;

        const statHeight = max => ((max * 0.5) / this.playerStatistics.iconsPerRow) * playerStatIconSize + this.playerStatistics.padding.y;

        const healthHeight = statHeight(this.player.health.state.max);
        const staminaHeight = statHeight(this.player.stamina.state.max);
        const hungerHeight = statHeight(this.player.hunger.state.max);

        const size = Vector2(
            (this.playerStatistics.padding.x * 2) + (this.playerStatistics.iconsPerRow * playerStatIconSize),
            (this.playerStatistics.padding.y * 2) + (healthHeight + staminaHeight + hungerHeight)
        );

        this.playerStatistics.cache.width = Math.floor(size.x);
        this.playerStatistics.cache.height = Math.floor(size.y);

        this.playerStatistics.cachectx.fillStyle = '#fff9';
        this.playerStatistics.cachectx.strokeStyle = '#000';
        this.playerStatistics.cachectx.lineWidth = 4;
        this.playerStatistics.cachectx.beginPath();
        this.playerStatistics.cachectx.moveTo(0, 0);
        this.playerStatistics.cachectx.lineTo(this.playerStatistics.cache.width, 0);
        this.playerStatistics.cachectx.lineTo(this.playerStatistics.cache.width, this.playerStatistics.cache.height);
        this.playerStatistics.cachectx.lineTo(0, this.playerStatistics.cache.height);
        this.playerStatistics.cachectx.lineTo(0, 0);
        this.playerStatistics.cachectx.fill();
        this.playerStatistics.cachectx.closePath();
        this.playerStatistics.cachectx.stroke();
        
        const position = Vector2( this.playerStatistics.padding.x, this.playerStatistics.padding.y );

        this._playerStatistic(this.player.stamina, playerStatIconSize, this.playerStatistics.iconsPerRow, position, this.tilemap.get('player.stamina.full'), this.tilemap.get('player.stamina.half'), this.tilemap.get('player.stamina.none'));
        position.y += staminaHeight;
        
        this._playerStatistic(this.player.health, playerStatIconSize, this.playerStatistics.iconsPerRow, position, this.tilemap.get('player.health.full'), this.tilemap.get('player.health.half'), this.tilemap.get('player.health.none'));
        position.y += healthHeight;

        this._playerStatistic(this.player.hunger, playerStatIconSize, this.playerStatistics.iconsPerRow, position, this.tilemap.get('player.hunger.full'), this.tilemap.get('player.hunger.half'), this.tilemap.get('player.hunger.none'));
        position.y += hungerHeight;

        this.playerStatistics.invalid = false;
    }

    /**
     * @private
     * @returns {void}
     */
    _updatePlayerInventoryCache() {
        const slotSize = Renderer.TileSize * this.playerInventory.slotSize * this.playerInventory.slotScale;

        const size = Vector2(
            Math.floor((this.player.inventory.size.x * slotSize) + ((this.player.inventory.size.x + 1) * this.playerInventory.info.padding.x)),
            this.playerInventory.visible ? Math.floor((this.player.inventory.size.y * slotSize) + ((this.player.inventory.size.y + 1) * this.playerInventory.info.padding.y)) : Math.floor(slotSize + this.playerInventory.info.padding.y * 2)
        );

        this.playerInventory.inventory.buffer.width = size.x;
        this.playerInventory.inventory.buffer.height = size.y;

        this.playerInventory.inventory.ctx.fillStyle = '#fff9';
        this.playerInventory.inventory.ctx.strokeStyle = '#000';
        this.playerInventory.inventory.ctx.lineWidth = 4;
        this.playerInventory.inventory.ctx.beginPath();
        this.playerInventory.inventory.ctx.moveTo(0, 0);
        this.playerInventory.inventory.ctx.lineTo(size.x, 0);
        this.playerInventory.inventory.ctx.lineTo(size.x, size.y);
        this.playerInventory.inventory.ctx.lineTo(0, size.y);
        this.playerInventory.inventory.ctx.lineTo(0, 0);
        this.playerInventory.inventory.ctx.fill();
        this.playerInventory.inventory.ctx.stroke();

        this.playerInventory.inventory.ctx.fillStyle = '#9999';
        this.playerInventory.inventory.ctx.lineJoin = 'round';
        this.playerInventory.inventory.ctx.lineWidth = 2;
        for (let x = 0; x < this.player.inventory.size.x; x++) {
            for (let y = 0; y < (this.playerInventory.visible ? this.player.inventory.size.y : 1); y++) {
                const position = Vector2(
                    this.playerInventory.info.padding.x + x * (slotSize + this.playerInventory.info.padding.x),
                    size.y - (y + 1) * (slotSize + this.playerInventory.info.padding.y)
                );
                if (y === 0 && x === this.player.inventory.inHand) {
                    this.playerInventory.inventory.ctx.fillStyle = '#fff9';
                    this.playerInventory.inventory.ctx.strokeStyle = '#ff7700';
                    this.playerInventory.inventory.ctx.lineWidth = 5;
                }
                else {
                    this.playerInventory.inventory.ctx.fillStyle = '#9999';
                    this.playerInventory.inventory.ctx.strokeStyle = '#000';
                    this.playerInventory.inventory.ctx.lineWidth = 2;
                }
                this.playerInventory.inventory.ctx.beginPath();
                this.playerInventory.inventory.ctx.moveTo(position.x, position.y);
                this.playerInventory.inventory.ctx.lineTo(position.x + slotSize, position.y);
                this.playerInventory.inventory.ctx.lineTo(position.x + slotSize, position.y + slotSize);
                this.playerInventory.inventory.ctx.lineTo(position.x, position.y + slotSize);
                this.playerInventory.inventory.ctx.lineTo(position.x, position.y);
                this.playerInventory.inventory.ctx.closePath();
                this.playerInventory.inventory.ctx.fill();   
                this.playerInventory.inventory.ctx.stroke();

                const itemStack = this.player.inventory.get(Vector2(x, y));
                if (itemStack) {
                    this.playerInventory.inventory.ctx.drawImage(this.tilemap.get(itemStack.id), position.x, position.y, slotSize, slotSize);
                    if (itemStack.count > 1) {
                        this.playerInventory.inventory.ctx.fillStyle = '#fff';
                        this.playerInventory.inventory.ctx.strokeStyle = '#000';
                        const fontSize = slotSize * 0.5;
                        this.playerInventory.inventory.ctx.font = `bold ${fontSize}px Courier`;
                        this.playerInventory.inventory.ctx.lineWidth = fontSize * 0.025;
                        const stackText = this.playerInventory.inventory.ctx.measureText(itemStack.count);
                        const stackTextPosition = Vector2(
                            position.x + this.playerInventory.info.padding.x * 0.5,
                            position.y + this.playerInventory.info.padding.y + (stackText.fontBoundingBoxAscent + stackText.fontBoundingBoxDescent) * 0.5
                        );
                        this.playerInventory.inventory.ctx.fillText(itemStack.count, stackTextPosition.x, stackTextPosition.y);
                        this.playerInventory.inventory.ctx.strokeText(itemStack.count, stackTextPosition.x, stackTextPosition.y);
                        this.playerInventory.inventory.ctx.lineWidth = 2;
                    }
                }
            }
        }

        this._updatePlayerInventoryCraftingGridCache(slotSize);

        this.playerInventory.invalid = false;
    }

    /**
     * @private
     * @param {number} slotSize
     * @returns {void}
     */
    _updatePlayerInventoryCraftingGridCache(slotSize) {
        const craftingGridSize = Vector2(
            Math.floor(this.player.inventory.craftingGrid.size.x * slotSize + (this.player.inventory.craftingGrid.size.x - 1) * this.playerInventory.info.padding.x + this.playerInventory.info.padding.x * 2),
            Math.floor((this.player.inventory.craftingGrid.size.y + 1) * slotSize + (this.player.inventory.craftingGrid.size.y * this.playerInventory.info.padding.y) + this.playerInventory.info.padding.y * 2)
        );
        
        this.playerInventory.crafting.buffer.width = craftingGridSize.x;
        this.playerInventory.crafting.buffer.height = craftingGridSize.y;
        
        this.playerInventory.crafting.ctx.fillStyle = '#9999';
        this.playerInventory.crafting.ctx.strokeStyle = '#000';
        this.playerInventory.crafting.ctx.lineJoin = 'round';
        this.playerInventory.crafting.ctx.lineWidth = 2;
        
        this.playerInventory.crafting.ctx.beginPath();
        this.playerInventory.crafting.ctx.moveTo(0, 1);
        this.playerInventory.crafting.ctx.lineTo(craftingGridSize.x - 1, 1);
        this.playerInventory.crafting.ctx.lineTo(craftingGridSize.x - 1, craftingGridSize.y - 1);
        this.playerInventory.crafting.ctx.lineTo(0, craftingGridSize.y - 1);
        this.playerInventory.crafting.ctx.fill();
        this.playerInventory.crafting.ctx.stroke();
        
        for (let x = 0; x < this.player.inventory.craftingGrid.size.x; x++) {
            for (let y = 0; y < this.player.inventory.craftingGrid.size.y; y++) {
                this.playerInventory.crafting.ctx.fillStyle = '#4c4c4c7F';
                const craftingPosition = Vector2(
                    x * slotSize + x * ((this.player.inventory.craftingGrid.size.x - 1) * this.playerInventory.info.padding.x * 0.5) + this.playerInventory.info.padding.x,
                    (y + 1) * slotSize + y * ((this.player.inventory.craftingGrid.size.y - 1) * this.playerInventory.info.padding.y * 0.5) + this.playerInventory.info.padding.y * 2
                );
                this.playerInventory.crafting.ctx.beginPath();
                this.playerInventory.crafting.ctx.moveTo(craftingPosition.x, craftingPosition.y);
                this.playerInventory.crafting.ctx.lineTo(craftingPosition.x + slotSize, craftingPosition.y);
                this.playerInventory.crafting.ctx.lineTo(craftingPosition.x + slotSize, craftingPosition.y + slotSize);
                this.playerInventory.crafting.ctx.lineTo(craftingPosition.x, craftingPosition.y + slotSize);
                this.playerInventory.crafting.ctx.lineTo(craftingPosition.x, craftingPosition.y);
                this.playerInventory.crafting.ctx.closePath();
                this.playerInventory.crafting.ctx.fill();
                this.playerInventory.crafting.ctx.stroke();

                const itemStack = this.player.inventory.craftingGrid.get(Vector2(x, y));
                if (itemStack) {
                    this.playerInventory.crafting.ctx.drawImage(this.tilemap.get(itemStack.id), craftingPosition.x, craftingPosition.y, slotSize, slotSize);
                    if (itemStack.count > 1) {
                        this.playerInventory.crafting.ctx.fillStyle = '#fff';
                        this.playerInventory.crafting.ctx.strokeStyle = '#000';
                        const fontSize = slotSize * 0.5;
                        this.playerInventory.crafting.ctx.font = `bold ${fontSize}px Courier`;
                        this.playerInventory.crafting.ctx.lineWidth = fontSize * 0.025;
                        const stackText = this.playerInventory.crafting.ctx.measureText(itemStack.count);
                        const stackTextPosition = Vector2(
                            craftingPosition.x + this.playerInventory.info.padding.x * 0.5,
                            craftingPosition.y + this.playerInventory.info.padding.y + (stackText.fontBoundingBoxAscent + stackText.fontBoundingBoxDescent) * 0.5
                        );
                        this.playerInventory.crafting.ctx.fillText(itemStack.count, stackTextPosition.x, stackTextPosition.y);
                        this.playerInventory.crafting.ctx.strokeText(itemStack.count, stackTextPosition.x, stackTextPosition.y);
                        this.playerInventory.crafting.ctx.lineWidth = 2;
                    }
                }
            }
        }

        const outputPosition = Vector2(
            craftingGridSize.x * 0.5 - slotSize * 0.5,
            this.playerInventory.info.padding.y
        );

        this.playerInventory.crafting.ctx.fillStyle = '#4c4c4c7F';
        this.playerInventory.crafting.ctx.beginPath();
        this.playerInventory.crafting.ctx.moveTo(outputPosition.x, outputPosition.y);
        this.playerInventory.crafting.ctx.lineTo(outputPosition.x + slotSize, outputPosition.y);
        this.playerInventory.crafting.ctx.lineTo(outputPosition.x + slotSize, outputPosition.y + slotSize);
        this.playerInventory.crafting.ctx.lineTo(outputPosition.x, outputPosition.y + slotSize);
        this.playerInventory.crafting.ctx.lineTo(outputPosition.x, outputPosition.y);
        this.playerInventory.crafting.ctx.fill();
        this.playerInventory.crafting.ctx.stroke();

        const outputStack = this.player.inventory.craftingGrid.output;
        if (outputStack !== null) {
            this.playerInventory.crafting.ctx.drawImage(this.tilemap.get(outputStack.id), outputPosition.x, outputPosition.y, slotSize, slotSize);
            if (outputStack.count > 1) {
                this.playerInventory.crafting.ctx.fillStyle = '#fff';
                this.playerInventory.crafting.ctx.strokeStyle = '#000';
                const fontSize = slotSize * 0.5;
                this.playerInventory.crafting.ctx.font = `bold ${fontSize}px Courier`;
                this.playerInventory.crafting.ctx.lineWidth = fontSize * 0.025;
                const stackText = this.playerInventory.crafting.ctx.measureText(itemStack.count);
                const stackTextPosition = Vector2(
                    craftingPosition.x + this.playerInventory.info.padding.x * 0.5,
                    craftingPosition.y + this.playerInventory.info.padding.y + (stackText.fontBoundingBoxAscent + stackText.fontBoundingBoxDescent) * 0.5
                );
                this.playerInventory.crafting.ctx.fillText(itemStack.count, stackTextPosition.x, stackTextPosition.y);
                this.playerInventory.crafting.ctx.strokeText(itemStack.count, stackTextPosition.x, stackTextPosition.y);
                this.playerInventory.crafting.ctx.lineWidth = 2;
            }
        }
    }
    
    /**
     * @private
     * @param {Tile} tile 
     * @returns {string}
     */
    _biomeToText(tile) { 
        let t = tile.id.split('.').filter(s => s !== 'tile');
        if (t[0] === 'water') t.reverse();
        return t.join(' ').replace('_', ' ');
    }

    /**
     * @private
     * @param {TileEntity} entity 
     * @returns {string}
     */
    _entityToText(entity) { 
        let t = entity.id.split('.').filter(s => s !== 'tile' && s !== 'entity');
        if (t[0] == 'water') t.reverse();
        return t.join(' ').replace('_', ' ');
    }

    /**
     * @private
     * @param {string} text
     * @param {Vector2} position 
     * @param {Vector2} size 
     * @param {Vector2} padding
     */
    _uiText(text, position, size, padding=Vector2(0, 0)) {
        const oldFill = this._buffer.ctx.fillStyle;
        
        this._buffer.ctx.beginPath();
        this._buffer.ctx.rect(position.x, position.y, size.x, size.y + padding.y * 2);
        this._buffer.ctx.fill();
        this._buffer.ctx.stroke();
        
        this._buffer.ctx.fillStyle = this._buffer.ctx.strokeStyle;

        const m = this._buffer.ctx.measureText(text);
        this._buffer.ctx.fillText(text, position.x + padding.x, position.y + padding.y + m.fontBoundingBoxAscent);
        
        this._buffer.ctx.strokeStyle = this._buffer.ctx.fillStyle;
        this._buffer.ctx.fillStyle = oldFill;
    }
    
    /**
     * @private
     * @param {string} text 
     * @param {Vector2} position 
     * @param {Vector2} padding
     * @param {number} width 
     * @param {number} verticalSpacing 
     * @returns {number}
     */
    _infoText(text, position, padding, width, verticalSpacing) {
        const size = this._buffer.ctx.measureText(text);
        const height = size.fontBoundingBoxAscent + size.fontBoundingBoxDescent;
        this._uiText(text, position, { x: width, y: height }, padding)
        return height + verticalSpacing;
    };

    /**
     * @private
     * @param {PlayerHealthStatistic|PlayerStaminaStatistic|PlayerHungerStatistic} stat 
     * @param {number} iconSize 
     * @param {number} iconsPerRow 
     * @param {Vector2} origin 
     * @param {HTMLImageElement} full 
     * @param {HTMLImageElement} half 
     * @param {HTMLImageElement} none 
     * @returns {void}
     */
    _playerStatistic(stat, iconSize, iconsPerRow, origin, full, half, none) {
        let j = 0;
        const halfStat = Math.floor(stat.state.max * 0.5);
        for (let i = 0; i < halfStat; i++) {
            if (i !== 0 && i % iconsPerRow === 0) j++;
            const position = Vector2(
                origin.x + ((i % iconsPerRow) * iconSize),
                origin.y +  (j * iconSize)
            );
            const statAtI = Math.floor(i * 2);
            const nextStat = Math.floor((i + 1) * 2);
            if (stat.state.current >= nextStat) this.playerStatistics.cachectx.drawImage(full, position.x, position.y, iconSize, iconSize);
            else if (stat.state.current >= statAtI + 1) this.playerStatistics.cachectx.drawImage(half, position.x, position.y, iconSize, iconSize);
            else this.playerStatistics.cachectx.drawImage(none, position.x, position.y, iconSize, iconSize);
        }
    };

    /**
     * @returns {void}
     */
    render(dt) {

        this._buffer.canvas.width = this.canvas.width;
        this._buffer.canvas.height = this.canvas.height;
        
        // render to buffer
        {
            const tileSize = Renderer.TileSize * this.zoom.current;
            const halfTileSize = tileSize * 0.5;
            const tileSizePadded = tileSize + 0.5;

            const halfCanvas = { w: this._buffer.canvas.width * 0.5, h: this._buffer.canvas.height * 0.5 };

            const playerPosition = Vector2(
                (this.player.position.x * tileSize) - halfCanvas.w,
                (this.player.position.y * tileSize) - halfCanvas.h
            );

            const centerOfCenterTileScreenPosition = {
                x: halfCanvas.w - halfTileSize,
                y: halfCanvas.h - halfTileSize
            };

            // render world
            {
                const viewport = {
                    x0: Math.floor(playerPosition.x / tileSize),
                    y0: Math.floor(playerPosition.y / tileSize),
                    x1: Math.ceil((playerPosition.x + this._buffer.canvas.width) / tileSize),
                    y1: Math.ceil((playerPosition.y + this._buffer.canvas.height) / tileSize),
                };
                
                for (let i = this.layerCache.range.min; i <= this.layerCache.range.max; i++) {
                    if (i === 0) { // render player
                        this._buffer.ctx.drawImage( // player
                            this.tilemap.get('player'), 
                            centerOfCenterTileScreenPosition.x, centerOfCenterTileScreenPosition.y, 
                            tileSize, tileSize
                        );
                        
                        this._buffer.ctx.drawImage( // player selection
                            this.player.selectionReachable(this.world.size) ? this.tilemap.get('player.selection.reachable') : this.tilemap.get('player.selection.default'), 
                            this.player.selection.position.x * tileSize - playerPosition.x - halfTileSize,
                            this.player.selection.position.y * tileSize - playerPosition.y - halfTileSize, 
                            tileSize, tileSize
                        );
                    }
                    else { // render world
                        const layer = this.layerCache.data[i];
                        for (const { tile, position } of layer) {
                            // viewport culling
                            if (position.x >= viewport.x0 && position.x <= viewport.x1 && position.y >= viewport.y0 && position.y <= viewport.y1) {
                                const height = (tile.height !== undefined ? tile.height - 1 : 0);

                                const pos = { x: position.x, y: position.y };

                                let tilePosition;

                                if (tile.randomizedPosition?.enabled) {
                                    pos.x += (tile.randomizedPosition.offset.x + tile.randomizedPosition.range.x * tile.randomizedPosition.seed.x);
                                    pos.y += (tile.randomizedPosition.offset.y + tile.randomizedPosition.range.y * tile.randomizedPosition.seed.y) * (height - 1);
                                    tilePosition = Vector2(
                                         pos.x           * tileSize - playerPosition.x - tileSize - 0.5,
                                        (pos.y - height) * tileSize - playerPosition.y - (tileSize * height) - 0.5
                                    )
                                }
                                else {
                                    tilePosition = Vector2(
                                         pos.x           * tileSize - playerPosition.x - halfTileSize - 0.5,
                                        (pos.y - height) * tileSize - playerPosition.y - halfTileSize - 0.5
                                    );
                                }

                                this._buffer.ctx.drawImage(
                                    this.tilemap.get(tile.id), 
                                    tilePosition.x,
                                    tilePosition.y, 
                                    tileSizePadded,
                                    tileSizePadded + height * tileSize
                                );

                                if (tile instanceof ItemStackEntity) {
                                    if (tile.itemStack.count > 1) {
                                        this._buffer.ctx.fillStyle = '#fff';
                                        this._buffer.ctx.strokeStyle = '#000';
                                        const fontSize = Renderer.TileSize * this.zoom.current * 0.4;
                                        this._buffer.ctx.font = `bold ${fontSize}px Courier`;
                                        this._buffer.ctx.lineWidth = fontSize * 0.025;
                                        const stackText = this._buffer.ctx.measureText(tile.itemStack.count);
                                        const stackTextPosition = Vector2(
                                            tilePosition.x + (tileSize * 0.025) * this.playerInventory.info.padding.x * 0.5,
                                            tilePosition.y + (tileSize * 0.0125) * this.playerInventory.info.padding.y + (stackText.fontBoundingBoxAscent + stackText.fontBoundingBoxDescent) * 0.5
                                        );
                                        this._buffer.ctx.fillText(tile.itemStack.count, stackTextPosition.x, stackTextPosition.y);
                                        this._buffer.ctx.strokeText(tile.itemStack.count, stackTextPosition.x, stackTextPosition.y);
                                        this._buffer.ctx.lineWidth = 2;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ========================= //
            // UI

            // player nametag
            if (this.zoom.current > 0.25 * Math.abs(this.zoom.range.min - this.zoom.range.max)) {
                this._buffer.ctx.font = `${halfTileSize}px Courier`;
                const nametag = this._buffer.ctx.measureText(this.player.name);
                const halfNametagWidth = nametag.width * 0.5;
                const nametagHeight = (nametag.fontBoundingBoxAscent + nametag.fontBoundingBoxDescent);
                const nametagTextOffset = (halfTileSize - halfNametagWidth);
                
                const nametagPadding = Vector2(10, 5);
    
                const nametagHeightPadded = nametagHeight + nametagPadding.y * 2;
                const nametagBox = {
                    x: centerOfCenterTileScreenPosition.x + nametagTextOffset + nametag.actualBoundingBoxLeft,
                    y: centerOfCenterTileScreenPosition.y - nametagHeight - nametagPadding.y * 2,
                    w: (tileSize + halfNametagWidth) - nametag.actualBoundingBoxLeft,
                    h: nametagHeightPadded
                };
    
                this._buffer.ctx.fillStyle = '#fff9';
                this._buffer.ctx.strokeStyle = '#000';
                this._uiText(this.player.name, { x: nametagBox.x - nametagPadding.x * 0.5, y: nametagBox.y }, { x: nametag.width + nametagPadding.x * 2, y: nametagHeight }, nametagPadding);
            }

            // player statistics
            this._buffer.ctx.drawImage(this.playerStatistics.cache, this.canvas.width - this.playerStatistics.cache.width, this.canvas.height - this.playerStatistics.cache.height);

            // player inventory
            this._buffer.ctx.drawImage(this.playerInventory.inventory.buffer, 0, this.canvas.height - this.playerInventory.inventory.buffer.height);
            if (this.playerInventory.visible) {
                const slotSize = Renderer.TileSize * this.playerInventory.slotSize * this.playerInventory.slotScale;
                const craftingGridPosition = Vector2(
                    Math.floor((this.player.inventory.size.x * slotSize) + ((this.player.inventory.size.x + 1) * this.playerInventory.info.padding.x)),
                    this.canvas.height - this.playerInventory.crafting.buffer.height
                );
                this._buffer.ctx.drawImage(this.playerInventory.crafting.buffer, craftingGridPosition.x, craftingGridPosition.y);
            }

            // player held item
            if (this.player.inventory.inMouse) {
                const inventoryItemSize = (this.mouse.inInventory || this.mouse.inInventoryCraftingGrid) ? (Renderer.TileSize * this.playerInventory.slotSize * this.playerInventory.slotScale) : tileSize; 
                const halfInventoryItemSize = inventoryItemSize * 0.5;
                const position = Vector2(
                    this.mouse.position.x - halfInventoryItemSize,
                    this.mouse.position.y - halfInventoryItemSize
                );
                this._buffer.ctx.drawImage(this.tilemap.get(this.player.inventory.inMouse.id), position.x, position.y, inventoryItemSize, inventoryItemSize);
                if (this.player.inventory.inMouse.count > 1) {
                    this._buffer.ctx.fillStyle = '#fff';
                    this._buffer.ctx.strokeStyle = '#000';
                    const fontSize = inventoryItemSize * 0.5;
                    this._buffer.ctx.font = `bold ${fontSize}px Courier`;
                    this._buffer.ctx.lineWidth = fontSize * 0.025;
                    const stackText = this._buffer.ctx.measureText(this.player.inventory.inMouse.count);
                    const stackTextPosition = Vector2(
                        position.x,
                        position.y + (stackText.fontBoundingBoxAscent + stackText.fontBoundingBoxDescent) * 0.5
                    );
                    this._buffer.ctx.fillText(this.player.inventory.inMouse.count, stackTextPosition.x, stackTextPosition.y);
                    this._buffer.ctx.strokeText(this.player.inventory.inMouse.count, stackTextPosition.x, stackTextPosition.y);
                    this._buffer.ctx.lineWidth = 2;
                }
            }

            // ------------------------- //
            // world information

            // render minimap
            this._buffer.ctx.drawImage(this.minimap.cache, this.minimap.position.x, this.minimap.position.y);

            // render player minimap icon
            { // NOSONAR javascript:S1199
                this._buffer.ctx.fillStyle = '#f00';
                this._buffer.ctx.strokeStyle = '#000';
                this._buffer.ctx.beginPath();
                this._buffer.ctx.arc(
                    this.minimap.position.x + this.player.targetPosition.x * this.minimap.scale.x,
                    this.minimap.position.y + this.player.targetPosition.y * this.minimap.scale.y,
                    6 * Math.min(this.minimap.scale.x, this.minimap.scale.y), 0, Math.PI * 2, false
                );
                this._buffer.ctx.fill();
                this._buffer.ctx.stroke();
            }
            
            // render minimap border
            {
                const minimapBorderWidth = 6;
                const halfMinimapBorderWidth = minimapBorderWidth * 0.5;
                this._buffer.ctx.lineWidth = minimapBorderWidth;
                this._buffer.ctx.lineCap = 'round';
                this._buffer.ctx.lineJoin = 'round';
                const l = {
                    x: this.minimap.position.x - halfMinimapBorderWidth,
                    y: this.minimap.position.y - halfMinimapBorderWidth
                };
        
                this._buffer.ctx.beginPath();
                this._buffer.ctx.moveTo(l.x, l.y);
                const rx = l.x + this.minimap.size.x + halfMinimapBorderWidth;
                this._buffer.ctx.lineTo(rx, l.y);
                const by = l.y + this.minimap.size.y + halfMinimapBorderWidth;
                this._buffer.ctx.lineTo(rx, by);
                this._buffer.ctx.lineTo(l.x, by);
                this._buffer.ctx.lineTo(l.x, l.y);
                this._buffer.ctx.stroke();
        
                this._buffer.ctx.lineWidth = 1;
            }

            // render info text
            {
                this._buffer.ctx.font = `${this.minimap.size.x * 0.065}px Courier`;

                const position = {
                    x: this.minimap.position.x,
                    y: this.minimap.position.y + this.minimap.size.y + this.minimap.info.verticalSpacing
                };

                this._buffer.ctx.fillStyle = '#fff9';

                // player position
                {
                    const positionText = `Position: x:${this.player.targetPosition.x.toString().padStart(this.world.width.toString().length, '0')}, y: ${this.player.targetPosition.y.toString().padStart(this.world.height.toString().length, '0')}`;
                    position.y += this._infoText(positionText, position, this.minimap.info.padding, this.minimap.size.x, this.minimap.info.verticalSpacing);
                }

                // current biome
                {
                    const currentTile = this.world.get(this.player.targetPosition);
                    const biomeText = `Biome: ${this._biomeToText(currentTile)}`;
                    position.y += this._infoText(biomeText, position, this.minimap.info.padding, this.minimap.size.x, this.minimap.info.verticalSpacing);
                }

                // selected tile
                {
                    const selectedTile = this.player.selectionInWorld(this.world.size) ? this.world.get(this.player.selection.position) : null;
                    if (selectedTile !== null) {
                        const selectedText = `Selected: ${selectedTile.entity !== null ? this._entityToText(selectedTile.entity) : this._biomeToText(selectedTile)}`;
                        position.y += this._infoText(selectedText, position, this.minimap.info.padding, this.minimap.size.x, this.minimap.info.verticalSpacing);
                    }
                }
            }

            // render fps
            {
                if (this._frameSampleTimeElapsed >= this._frameSampleTime) {
                    this._frameTime = dt;
                    this._frameSampleTimeElapsed = 0;
                }

                const fpsValue = 1.0 / (this._frameTime * 0.001);
                const outsidePrecision = Number.isInteger(fpsValue);
                const fps = `FPS${outsidePrecision ? '*' : ''}: ${fpsValue.toFixed(3).padStart(12 - Number(outsidePrecision), ' ')}`;
                const fpsm = this._buffer.ctx.measureText(fps);
                const fpsmwo = fpsm.width * 0.5;
                const fpsmh = (fpsm.fontBoundingBoxAscent + fpsm.fontBoundingBoxDescent);
                const fpsmho = fpsmh * 0.5;
                this._buffer.ctx.fillStyle = '#fff9';
                this._buffer.ctx.fillRect(this._buffer.canvas.width - fpsm.width - fpsmwo * 0.5, 0, fpsm.width + fpsmwo, fpsmh + fpsmho);
                this._buffer.ctx.fillStyle = '#000';
                this._buffer.ctx.fillText(fps.includes('Infinity') ? `FPS: Unmeasurable` : fps, this._buffer.canvas.width - fpsm.width - fpsmwo * 0.25, fpsmh);

                this._frameSampleTimeElapsed += dt;
            }
        }

        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.ctx.drawImage(this._buffer.canvas, 0, 0);
    }

    /**
     * @param {WheelEvent} e 
     */
    onwheel(e) {
        this.zoom.target = Math.min(Math.max(this.zoom.target + e.deltaY * -this.zoom.sensitivity, this.zoom.range.min), this.zoom.range.max);
    }

}

export default Renderer;