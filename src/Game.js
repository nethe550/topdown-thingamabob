import Registry from './Registry.js';

import Vector2 from './util/Vector2.js';
import Canvas from './dom/Canvas.js';
import TileEntity from './world/tile/TileEntity.js';
import ItemStackEntity from './world/item/ItemStackEntity.js';
import TileMap from './world/tile/TileMap.js';
import World from './world/World.js';
import Player from './world/player/Player.js';
import ItemStack from './world/item/ItemStack.js';
import Renderer from './dom/Renderer.js';

/**
 * @typedef {import('./util/Vector2.js').Vector2} Vector2
 * @typedef {import('./world/player/Player.js').PlayerStatistic} PlayerStatistic
 * @typedef {import('./dom/Renderer.js').ZoomSettings} ZoomSettings
 * @typedef {import('./dom/Renderer.js').MinimapSettings} MinimapSettings
 * 
 * @typedef {{ creative: boolean }} DebugSettings
 * @typedef {{ element: string, autoResize: boolean }} CanvasSettings
 * @typedef {{ name: string, position: { centered: boolean, forceOnLand: boolean, position: Vector2 }, maxSelectionDistance: number, health: PlayerStatistic, stamina: PlayerStatistic, hunger: PlayerStatistic }} PlayerSettings
 * @typedef {{ size: Vector2 }} WorldSettings
 * @typedef {{ zoomSettings: ZoomSettings, minimapSettings: MinimapSettings }} RendererSettings
 * 
 * @typedef {{ mouse: { position: Vector2, buttons: { left: boolean, right: boolean } }, canMove: boolean, movement: Vector2, sprint: boolean, inventory: boolean }} InputState
 */

/**
 * @class
 */
class Game {

    /**
     * @readonly
     * @type {string}
     */
    static Version = '0.0.4-prealpha';

    /**
     * @type {DebugSettings}
     */
    static DEBUG = { creative: false };

    /**
     * @private
     * @type {Canvas}
     */
    _canvas = null;

    /**
     * @private
     * @type {TileMap}
     */
    _tilemap = null;

    /**
     * @private
     * @type {World}
     */
    _world = null;

    /**
     * @private
     * @type {Player}
     */
    _player = null;

    /**
     * @private
     * @type {Renderer}
     */
    _renderer = null;

    /**
     * @private
     * @type {InputState}
     */
    _input = {
        mouse: {
            position: Vector2(0, 0),
            buttons: { left: false, right: false }
        },
        canMove: false,
        movement: Vector2(0, 0),
        sprint: false,
        inventory: false
    };

    /**
     * @private
     * @type {number}
     */
    _lastFrameTime = 0;

    /**
     * @private
     * @type {number}
     */
    _updateloop = -1;

    /**
     * @param {boolean} autoStart
     * @param {Canvas} canvas 
     * @param {TileMap} tilemap 
     * @param {World} world 
     * @param {Player} player 
     * @param {Renderer} renderer 
     */
    constructor(autoStart, canvas, tilemap, world, player, renderer) {

        console.info(`Top-Down Thingamabob | ${Game.Version}`);
        document.title += ` (${Game.Version})`;

        this._canvas = canvas;
        this._tilemap = tilemap;
        this._world = world;
        this._player = player;
        this._renderer = renderer;

        this._canvas.element.addEventListener('contextmenu', e => e.preventDefault());

        // player selection
        window.addEventListener('mousemove', e => {
            this._updatePlayerSelection(e);
            
            const mouse = Vector2(e.clientX, this._canvas.height - e.clientY);
            const slotSize = Renderer.TileSize * this._renderer.playerInventory.slotSize * this._renderer.playerInventory.slotScale;
            const slot = Vector2(
                Math.floor((mouse.x - this._renderer.playerInventory.info.padding.x) / (slotSize + this._renderer.playerInventory.info.padding.x)),
                Math.floor((mouse.y - this._renderer.playerInventory.info.padding.y) / (slotSize + this._renderer.playerInventory.info.padding.y))
            );
            const craftingSlot = Vector2(
                Math.floor((mouse.x - this._renderer.playerInventory.info.padding.x) / (slotSize + this._renderer.playerInventory.info.padding.x)) - this._player.inventory.size.x,
                Math.floor((mouse.y - this._renderer.playerInventory.info.padding.y) / (slotSize + this._renderer.playerInventory.info.padding.y))
            );
            const insideInventory = slot.x >= 0 && slot.x < this._player.inventory.size.x && slot.y >= 0 && slot.y < this._player.inventory.size.y;
            const insideCraftingGrid = craftingSlot.x >= 0 && craftingSlot.x < this._player.inventory.craftingGrid.size.x && craftingSlot.y >= 0 && craftingSlot.y < (this._player.inventory.craftingGrid.size.y + 1);

            this._renderer.mouse.position = this._input.mouse.position;
            this._renderer.mouse.inInventory = insideInventory;
            this._renderer.mouse.inInventoryCraftingGrid = insideCraftingGrid;
        });

        // player inventory
        window.addEventListener('mousedown', e => {
            this._input.mouse.buttons.left = e.button === 0;
            this._input.mouse.buttons.right = e.button === 2;
            const box = this._canvas.element.getBoundingClientRect();
            this._updateMouseInteraction(
                Vector2(e.clientX - box.left, e.clientY - box.top),
                this._renderer.playerInventory.slotSize,
                this._renderer.playerInventory.slotScale,
                this._renderer.playerInventory.info.padding
            );
        });

        window.addEventListener('keydown', e => {
            const key = e.key.toLowerCase();
            // player inventory
            const n = Number(key);
            if (!isNaN(n) && n >= 1 && n <= this._player.inventory.size.x) {
                this._player.inventory.inHand = n - 1;
                this._renderer.playerInventory.invalid = true;
            }

            // player movement
            switch (key) {
                case 'tab':
                case 'e':
                case 'escape':
                    e.stopPropagation();
                    e.preventDefault();
                    this._input.inventory = !this._input.inventory;
                    break;
                case 'arrowup':
                case 'w':
                    this._input.movement.y = -1;
                    break;
                case 'arrowdown':
                case 's':
                    this._input.movement.y = 1;
                    break;
                case 'arrowleft':
                case 'a':
                    this._input.movement.x = -1;
                    break;
                case 'arrowright':
                case 'd':
                    this._input.movement.x = 1;
                    break;
                case 'shift':
                    this._input.sprint = true;
                    break;
            }
        });

        window.addEventListener('keyup', e => {
            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                case 'arrowdown':
                case 's':
                    this._input.movement.y = 0;
                    break;
                case 'arrowleft':
                case 'a':
                case 'arrowright':
                case 'd':
                    this._input.movement.x = 0;
                    break;
                case 'shift':
                    this._input.sprint = false;
                    break;
            }
        });

        // zoom
        window.addEventListener('wheel', e => {
            this._renderer.onwheel(e);
            this._updatePlayerSelection({ clientX: this._input.mouse.position.x, clientY: this._input.mouse.position.y });
        });

        this._player.addEventListener('inventoryChanged', () => this._renderer.playerInventory.invalid = true);

        this._renderer.playerStatistics.invalid = true;

        if (autoStart) this.start();
    }

    /**
     * @type {TileMap}
     */
    get tilemap() { return this._tilemap; }

    /**
     * @returns {void}
     */
    start() {
        if (this._updateloop !== -1) this.stop();
        this._updateloop = requestAnimationFrame(this._update.bind(this));
    }

    /**
     * @returns {void}
     */
    stop() {
        if (this._updateloop !== -1) cancelAnimationFrame(this._updateloop);
        this._updateloop = -1;
    }

    /**
     * @private
     * @returns {void}
     */
    _update() {
        const dt = performance.now() - this._lastFrameTime;

        this._input.canMove = Vector2(
            this._player.position.x === this._player.targetPosition.x,
            this._player.position.y === this._player.targetPosition.y
        );
        if ((this._input.movement.x !== 0 && this._input.canMove.x) || (this._input.movement.y !== 0 && this._input.canMove.y)) this._player.moveTarget(this._input.movement.x, this._input.movement.y, this._world);
        
        this._updatePlayerSelection({ clientX: this._input.mouse.position.x, clientY: this._input.mouse.position.y });
        this._renderer.update();
        this._renderer.render(dt);

        this._player.sprint.sprinting = this._input.sprint;

        const { playerStatisticsInvalid } = this._player.update(dt, this._world);
        this._renderer.playerStatistics.invalid = playerStatisticsInvalid;

        if (this._renderer.playerInventory.visible !== this._input.inventory) {
            this._renderer.playerInventory.visible = this._input.inventory;
            this._renderer.playerInventory.invalid = true;
        }

        this._lastFrameTime = performance.now();
        this._updateloop = requestAnimationFrame(this._update.bind(this));
    }

    /**
     * @private
     * @param {MouseEvent} e
     * @returns {void}
     */
    _updatePlayerSelection(e) {
        const box = this._canvas.element.getBoundingClientRect();
        this._input.mouse.position.x = e.clientX - box.left;
        this._input.mouse.position.y = e.clientY - box.top;
        const tileSize = Renderer.TileSize * this._renderer.zoom.current;
        const mouseWorldPosition = {
            x: Math.floor((this._input.mouse.position.x + tileSize * 0.5 + this._player.position.x * tileSize - this._canvas.width * 0.5) / tileSize),
            y: Math.floor((this._input.mouse.position.y + tileSize * 0.5 + this._player.position.y * tileSize - this._canvas.height * 0.5) / tileSize)
        };
        this._player.selection.position = mouseWorldPosition;
    }

    /**
     * @private
     * @param {Vector2} mouse
     * @returns {void}
     */
    _worldEntityMouseInteraction(mouse) {
        const tileSize = Renderer.TileSize * this._renderer.zoom.current;
        const worldPosition = Vector2(
            Math.floor((mouse.x + tileSize * 0.5 + this._player.position.x * tileSize - this._canvas.width * 0.5) / tileSize),
            Math.floor((mouse.y + tileSize * 0.5 + this._player.position.y * tileSize - this._canvas.height * 0.5) / tileSize)
        );
        const tileAtMouse = this._world.get(worldPosition);
        
        // can reach tile
        if (this._player.selectionReachable(this._world.size)) { 

            // tile entity exists
            if (tileAtMouse.entity !== null) {

                // tile populated with item stack entity
                if (tileAtMouse.entity instanceof ItemStackEntity) {
                    // holding item stack in mouse
                    if (this._player.inventory.inMouse !== null) {
                        // attempt to merge item stack held by mouse with item stack in world
                        if (this._player.inventory.inMouse.id === tileAtMouse.entity.id) {
                            const out = ItemStack.MergeStacks(this._player.inventory.inMouse, tileAtMouse.entity.itemStack);
                            if (out.result) { // successful merge
                                this._world.setEntity(worldPosition, new ItemStackEntity(out.result, -2));
                                if (out.overflow) this._player.inventory.inMouse = out.overflow;
                                else this._player.inventory.inMouse = null;
                                this._renderer.layerCache.invalid = true;
                                this._renderer.minimap.invalid = true;
                            }
                        }
                    }
                    // take item stack into mouse
                    else {
                        this._player.inventory.inMouse = tileAtMouse.entity.itemStack;
                        this._world.setEntity(worldPosition, null);
                        this._renderer.layerCache.invalid = true;
                        this._renderer.minimap.invalid = true;

                    }
                }
                // tile populated with tile entity
                else if (tileAtMouse.entity instanceof TileEntity) {
                    const itemStackInHand = this._player.inventory.get(Vector2(this._player.inventory.inHand, 0));
    
                    // holding item
                    if (itemStackInHand !== null) {
                        // can use item
                        if (Registry.Tools[itemStackInHand?.id] && Registry.Tools[itemStackInHand?.id].usage[tileAtMouse.entity?.id].canUse) {
                            const dropAmount = Registry.Tools[itemStackInHand.id].usage[tileAtMouse.entity.id].effectiveness;
                            if (dropAmount > 0) {
                                if (tileAtMouse.entity.id === 'tile.entity.workbench') this._player.workbenchCache = this._player.workbenchCache.filter(p => p.x !== worldPosition.x && p.y !== worldPosition.y);
                                const itemStack = new ItemStack(Registry.TileEntities[tileAtMouse.entity.id].item, dropAmount); 
                                this._world.setEntity(worldPosition, new ItemStackEntity(itemStack, -2));
                                this._renderer.layerCache.invalid = true;
                                this._renderer.minimap.invalid = true;
                            }
                        }
                    }
                    // not holding item
                    else {
                        // can interact with tile
                        if (Registry.Tools['hand'].usage[tileAtMouse.entity?.id]?.canUse) {
                            const dropAmount = Registry.Tools['hand'].usage[tileAtMouse.entity.id].effectiveness;
                            if (dropAmount > 0) {
                                const itemStack = new ItemStack(Registry.TileEntities[tileAtMouse.entity.id].item, dropAmount);
                                this._world.setEntity(worldPosition, new ItemStackEntity(itemStack, -2));
                                this._renderer.layerCache.invalid = true;
                                this._renderer.minimap.invalid = true;
                            }
                        }
                    }
                }
                // place held mouse item stack in world
                else if (this._player.inventory.inMouse !== null) {
                    this._world.setEntity(worldPosition, new ItemStackEntity(this._player.inventory.inMouse, -2));
                    this._player.inventory.inMouse = null;
                    this._renderer.layerCache.invalid = true;
                    this._renderer.minimap.invalid = true;
                }
            }
            // no tile entity
            else {
                // if item stack held by mouse and mouse within the world, place in world
                if (this._player.inventory.inMouse && worldPosition.x >= 0 && worldPosition.x < this._world.width && worldPosition.y >= 0 && worldPosition.y < this._world.height) {
                    switch (Registry.Items[this._player.inventory.inMouse.id].placeInWorld.type) {
                        case 'entity':
                            if (this._player.inventory.inMouse.id === 'item.workbench') this._player.workbenchCache.push(worldPosition);
                            this._world.setEntity(worldPosition, new TileEntity(Registry.Items[this._player.inventory.inMouse.id].placeInWorld.entity, -2));
                            this._player.inventory.inMouse = null;
                            this._renderer.layerCache.invalid = true;
                            this._renderer.minimap.invalid = true;
                            break;
                        case 'item':
                        default:
                            this._world.setEntity(worldPosition, new ItemStackEntity(this._player.inventory.inMouse, -2));
                            this._player.inventory.inMouse = null;
                            this._renderer.layerCache.invalid = true;
                            this._renderer.minimap.invalid = true;
                            break;
                    }
                }
            }
        }
    }

    /**
     * @private
     * @param {Vector2} mouse
     * @param {number} inventorySlotSize
     * @param {number} inventorySlotScale
     * @param {Vector2} inventoryPadding
     */
    _updateMouseInteraction(mouse, inventorySlotSize, inventorySlotScale, inventoryPadding) {

        // inventory is open
        if (this._input.inventory) {
            const slotSize = Renderer.TileSize * inventorySlotSize * inventorySlotScale;
            
            const slot = Vector2(
                Math.floor((mouse.x - inventoryPadding.x) / (slotSize + inventoryPadding.x)),
                Math.floor(((this._canvas.height - mouse.y) - inventoryPadding.y) / (slotSize + inventoryPadding.y))
            );

            const craftingGridHeight = Math.floor((this._player.inventory.craftingGrid.size.y + 1) * slotSize + (this._player.inventory.craftingGrid.size.y) * inventoryPadding.y) + inventoryPadding.y * 2;

            const craftingSlot = Vector2(
                Math.floor((mouse.x - inventoryPadding.x) / (slotSize + inventoryPadding.x)) - this._player.inventory.size.x,
                Math.floor((mouse.y - this._canvas.height + craftingGridHeight) / (slotSize + inventoryPadding.y)) - 1
            );

            const insideInventory = slot.x >= 0 && slot.x < this._player.inventory.size.x && slot.y >= 0 && slot.y < this._player.inventory.size.y;
            const insideCraftingGrid = craftingSlot.x >= 0 && craftingSlot.x < this._player.inventory.craftingGrid.size.x && craftingSlot.y >= 0 && craftingSlot.y < this._player.inventory.craftingGrid.size.y;
            const insideCraftingOutput = craftingSlot.y === -1;

            // nothing held by the mouse
            if (!this._player.inventory.inMouse) {
                // hovering over inventory
                if (insideInventory) {
                    const itemStack = this._player.inventory.get(slot);
                    if (itemStack !== null) {
                        // take stack from inventory slot
                        if (this._input.mouse.buttons.left) {
                            this._player.inventory.inMouse = itemStack;
                            this._player.inventory.set(slot, null);
                            this._renderer.playerInventory.invalid = true;
                        }
                        // split stack from inventory slot
                        else if (this._input.mouse.buttons.right) {
                            // just take stack
                            if (itemStack.count === 1) {
                                this._player.inventory.inMouse = itemStack;
                                this._player.inventory.set(slot, null);
                                this._renderer.playerInventory.invalid = true;
                            }
                            // split stack
                            else {
                                const splitAmount = Math.round(itemStack.count * 0.5);
                                if (splitAmount > 0) {
                                    this._player.inventory.inMouse = new ItemStack(itemStack.id, splitAmount);
                                    this._player.inventory.set(slot, new ItemStack(itemStack.id, itemStack.count - splitAmount));
                                    this._renderer.playerInventory.invalid = true;
                                }
                            }
                        }
                    }
                }
                // hovering over crafting grid
                else if (insideCraftingGrid) {
                    // take stack from crafting slot
                    const itemStack = this._player.inventory.craftingGrid.get(craftingSlot);
                    if (itemStack !== null) {
                        if (this._input.mouse.buttons.left) {
                            this._player.inventory.inMouse = itemStack;
                            this._player.inventory.craftingGrid.set(craftingSlot, null);
                            this._player.inventory.craftingGrid.update();
                            this._renderer.playerInventory.invalid = true;
                        }
                        // split stack from crafting slot
                        else if (this._input.mouse.buttons.right) {
                            // just take stack
                            if (itemStack.count === 1) {
                                this._player.inventory.inMouse = itemStack;
                                this._player.inventory.craftingGrid.set(craftingSlot, null);
                                this._player.inventory.craftingGrid.update();
                                this._renderer.playerInventory.invalid = true;
                            }
                            // split stack
                            else {
                                const splitAmount = Math.round(itemStack.count * 0.5);
                                if (splitAmount > 0) {
                                    this._player.inventory.inMouse = new ItemStack(itemStack.id, splitAmount);
                                    this._player.inventory.craftingGrid.set(craftingSlot, new ItemStack(itemStack.id, itemStack.count - splitAmount));
                                    this._player.inventory.craftingGrid.update();
                                    this._renderer.playerInventory.invalid = true;
                                }
                            }
                        }
                    }
                }
                // take stack from crafting output
                else if (insideCraftingOutput) {
                    const itemStack = this._player.inventory.craftingGrid.output;
                    if (itemStack !== null) {
                        this._player.inventory.inMouse = itemStack;
                        this._player.inventory.craftingGrid.update();
                        this._player.inventory.craftingGrid.consume();
                        this._renderer.playerInventory.invalid = true;
                    }
                }
                // hovering over world
                else this._worldEntityMouseInteraction(mouse);
            }
            // holding item stack with mouse
            else {
                // hovering over inventory
                if (insideInventory) {
                    const existingStack = this._player.inventory.get(slot);

                    // stack already in desired inventory slot
                    if (existingStack !== null) {
                        // try to merge stacks of the same type
                        if (existingStack.id === this._player.inventory.inMouse.id) {
                            const leftoverStack = this._player.inventory.mergeStack(slot, this._player.inventory.inMouse);
                            this._player.inventory.inMouse = leftoverStack;
                        }
                        // otherwise swap currently held stack with stack in inventory
                        else {
                            const tmp = this._player.inventory.inMouse;
                            this._player.inventory.inMouse = existingStack;
                            this._player.inventory.set(slot, tmp);
                        }
                    }
                    // put stack in inventory slot
                    else {
                        this._player.inventory.set(slot, this._player.inventory.inMouse);
                        this._player.inventory.inMouse = null;
                    }

                    this._renderer.playerInventory.invalid = true;
                }
                // hovering over crafting grid
                else if (insideCraftingGrid) {
                    const existingStack = this._player.inventory.craftingGrid.get(craftingSlot);

                    // slot occupied
                    if (existingStack !== null) {
                        // attempt to merge
                        if (existingStack.id === this._player.inventory.inMouse.id) {
                            const leftoverStack = this._player.inventory.craftingGrid.mergeStack(craftingSlot, this._player.inventory.inMouse);
                            this._player.inventory.inMouse = leftoverStack;
                            this._player.inventory.craftingGrid.update();
                        }
                        // swap held stack with stack in crafting grid
                        else {
                            const tmp = this._player.inventory.inMouse;
                            this._player.inventory.inMouse = existingStack;
                            this._player.inventory.craftingGrid.set(craftingSlot, tmp);
                            this._player.inventory.craftingGrid.update();
                        }
                    }
                    else {
                        this._player.inventory.craftingGrid.set(craftingSlot, this._player.inventory.inMouse);
                        this._player.inventory.inMouse = null;
                        this._player.inventory.craftingGrid.update();
                    }

                    this._renderer.playerInventory.invalid = true;
                }
                // hovering over world
                else this._worldEntityMouseInteraction(mouse);
            }
        } 
        else this._worldEntityMouseInteraction(mouse);
    }

    /**
     * @async
     * @param {boolean} autoStart
     * @returns {Game}
     */
    static async Init(autoStart=false) {
        const c = new Canvas(Registry.DOM.element, Registry.DOM.autoResize);
        const t = await TileMap.Create(); // NOSONAR javascript:S4123
        const w = new World(Registry.World.size.x, Registry.World.size.y, t);
        const p = new Player(
            Registry.Player.name,
            Registry.Player.position.centered ? Vector2(Math.floor(w.width * 0.5), Math.floor(w.height * 0.5)) : Registry.Player.position.position,
            Registry.Player.selection.maxSelectionDistance,
            Player.HealthStatistic(Registry.Player.statistics.health.max, Registry.Player.statistics.health.max, Registry.Player.statistics.health.consumption),
            Player.StaminaStatistic(Registry.Player.statistics.stamina.max, Registry.Player.statistics.stamina.max, Registry.Player.statistics.stamina.regeneration.delay, Registry.Player.statistics.stamina.regeneration.amount, Registry.Player.statistics.stamina.consumption),
            Player.HungerStatistic(Registry.Player.statistics.hunger.max, Registry.Player.statistics.hunger.max, Registry.Player.statistics.hunger.consumption),
            Registry.Player.sprintSettings
        );

        if (Registry.Player.position.forceOnLand) {
            while (['tile.water.deep', 'tile.water.shallow'].indexOf(w.get(p.position).id) !== -1 || (w.get(p.position).entity ? Registry.TileEntities[w.get(p.position).entity.id]?.collision : false)) {
                const position = {
                    x: Math.floor(Math.random() * w.width),
                    y: Math.floor(Math.random() * w.height)
                };
                p.position.x = position.x;
                p.position.y = position.y;
                p.targetPosition.x = position.x;
                p.targetPosition.y = position.y;
            }
        }

        const r = new Renderer(c, t, w, p, 
            Renderer.ZoomSettings(Registry.Renderer.zoomSettings.current, Registry.Renderer.zoomSettings.range, Registry.Renderer.zoomSettings.sensitivity), 
            Renderer.MinimapSettings(Registry.Renderer.minimapSettings.position, Registry.Renderer.minimapSettings.scale),
            Renderer.PlayerStatisticSettings(Registry.Renderer.playerStatisticSettings.scale, Registry.Renderer.playerStatisticSettings.padding, Registry.Renderer.playerStatisticSettings.iconsPerRow), 
            Renderer.PlayerInventorySettings(Registry.Renderer.playerInventorySettings.slotSize, Registry.Renderer.playerInventorySettings.slotScale, Registry.Renderer.playerInventorySettings.padding)
        );

        c.onresize = size => {
            const minimapScale = Math.min((size.x * 0.333) / w.width, (size.y * 0.333) / w.height);
            r.minimap.scale.x = minimapScale;
            r.minimap.scale.y = minimapScale;
            r.minimap.invalid = true;

            const playerStatsScale = Math.min((size.x * 0.125) / w.width, (size.y * 0.125) / w.height);
            r.playerStatistics.scale = playerStatsScale;
            r.playerStatistics.invalid = true;

            const playerInventoryScale = Math.min((size.x * 0.25) / w.width, (size.y * 0.25) / w.height);
            r.playerInventory.slotScale = playerInventoryScale;
            r.playerInventory.invalid = true;
        };
        return new Game(autoStart, c, t, w, p, r);
    }

}

export default Game;