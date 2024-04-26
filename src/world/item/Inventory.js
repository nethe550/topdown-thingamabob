import Vector2 from '../../util/Vector2.js';
import ItemStack from './ItemStack.js';

/**
 * @typedef {import('../../util/Vector2.js').Vector2} Vector2
 */

/**
 * @class
 */
class Inventory {

    /**
     * @protected
     * @type {Vector2}
     */
    _size = Vector2(6, 5);

    /**
     * @protected
     * @type {Array<Array<ItemStack>>}
     */
    _itemStacks = null;

    constructor(size=Vector2(6, 5)) {
        this._size = size;
        
        this._itemStacks = [];
        for (let x = 0; x < this._size.x; x++) {
            this._itemStacks[x] = [];
            for (let y = 0; y < this._size.y; y++) {
                this._itemStacks[x][y] = null;
            }
        }
    }

    /**
     * @type {Vector2}
     */
    get size() { return this._size; }

    /**
     * @returns {void}
     */
    clear() {
        for (let x = 0; x < this._size.x; x++) {
            for (let y = 0; y < this._size.y; y++) {
                this._itemStacks[x][y] = null;
            }
        }
    }

    /**
     * @param {Vector2} position
     * @returns {ItemStack|null}
     */
    get(position) {
        return this._itemStacks[position.x][position.y];
    }

    /**
     * @param {Vector2} position 
     * @param {ItemStack} stack 
     * @returns {void}
     */
    set(position, stack) {
        this._itemStacks[position.x][position.y] = stack;
    }

    /**
     * @param {Vector2} position
     * @returns {void}
     */
    addItem(position) {
        this._itemStacks[position.x][position.y].addItem();
    }

    /**
     * @param {Vector2} position 
     * @returns {void}
     */
    removeItem(position) {
        this._itemStacks[position.x][position.y].removeItem();
    }

    /**
     * @param {Vector2} position 
     * @param {ItemStack} stack 
     * @returns {void}
     */
    mergeStack(position, stack) {
        const src = this._itemStacks[position.x][position.y];
        let mergedCount = src.count + stack.count;
        this._itemStacks[position.x][position.y] = new ItemStack(src.id, Math.min(src.count + stack.count, src.max), src.max);
        if (mergedCount > src.max) {
            mergedCount -= src.max;
            return new ItemStack(src.id, mergedCount, src.max);
        }
        return null;
    }

}

export default Inventory;