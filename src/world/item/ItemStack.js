import Registry from '../../Registry.js';

/**
 * @typedef {import('./Item.js').default} Item
 */

/**
 * @class
 */
class ItemStack {

    /**
     * @private
     * @type {string}
     */
    _id = null;

    /**
     * @private
     * @type {number}
     */
    _count = 1;

    /**
     * @private
     * @type {number}
     */
    _max = 10;

    /**
     * @param {string} id 
     * @param {number} count 
     * @param {number} max 
     */
    constructor(id, count=1, max=null) {
        this._id = id;
        this._count = count;
        this._max = max !== null ? max : Registry.World.itemStackSize[this._id];
    }

    /**
     * @type {string}
     */
    get id() { return this._id; }

    /**
     * @type {number}
     */
    get count() { return this._count; }

    /**
     * @param {number} c
     */
    set count(c) { this._count = c; }

    /**
     * @type {number}
     */
    get max() { return this._max; }

    /**
     * @returns {void}
     */
    addItem() {
        if (this._count < this._max) this._count++;
    }

    /**
     * @returns {void}
     */
    removeItem() {
        if (this._count > 0) this._count--;
    }

    /**
     * @param {ItemStack} a 
     * @param {ItemStack} b 
     * @returns {{ result: ItemStack|null, overflow: ItemStack|null }}
     */
    static MergeStacks(a, b) {
        if (a.id !== b.id) return { result: null, overflow: null };

        let mergedCount = a.count + b.count;
        const output = {
            result: new ItemStack(a.id, Math.min(mergedCount, a.max), a.max),
            overflow: null
        };
        
        if (mergedCount > a.max) {
            mergedCount -= a.max;
            output.overflow = new ItemStack(a.id, mergedCount, a.max);
        }

        return output;
    }

}

export default ItemStack;