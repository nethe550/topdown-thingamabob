import Inventory from '../item/Inventory.js';
import CraftingGrid from '../craft/CraftingGrid.js';
import Vector2 from '../../util/Vector2.js';
import ItemStack from '../item/ItemStack.js';

/**
 * @typedef {import('../../util/Vector2.js').Vector2} Vector2
 */

/**
 * @class
 */
class PlayerInventory extends Inventory {

    /**
     * @private 
     * @type {number}
     */
    _inHand = 0;

    /**
     * @private
     * @type {ItemStack|null}
     */
    _inMouse = null;

    /**
     * @private
     * @type {CraftingGrid|null}
     */
    _craftingGrid = null;

    constructor(size=Vector2(6, 5)) {
        super(size);
        this._craftingGrid = new CraftingGrid(Vector2(2, 2));
    }

    /**
     * @type {number}
     */
    get inHand() { return this._inHand; }

    /**
     * @param {number} ih
     */
    set inHand(ih) { this._inHand = Math.min(Math.max(Math.floor(ih), 0), this._size.x - 1); }

    /**
     * @type {ItemStack|null}
     */
    get inMouse() { return this._inMouse; }

    /**
     * @param {ItemStack|null} im
     */
    set inMouse(im) { this._inMouse = im; }

    /**
     * @type {CraftingGrid}
     */
    get craftingGrid() { return this._craftingGrid; }

    /**
     * @param {CraftingGrid} cg
     */
    set craftingGrid(cg) { this._craftingGrid = cg; }

}

export default PlayerInventory;