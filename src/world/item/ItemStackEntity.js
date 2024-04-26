import Vector2 from '../../util/Vector2.js';
import TileEntity from '../tile/TileEntity.js';

/**
 * @typedef {import('./ItemStack.js').default} ItemStack
 */

/**
 * @class
 */
class ItemStackEntity extends TileEntity {

    /**
     * @type {ItemStack}
     */
    _itemStack = null;

    /**
     * @param {ItemStack} itemStack 
     * @param {number} layer 
     */
    constructor(itemStack, layer=0) {
        super(itemStack.id, layer, 1, TileEntity.RandomizedPosition(false, Vector2(0, 0), Vector2(0, 0), 0));
        this._itemStack = itemStack;
    }

    /**
     * @type {ItemStack}
     */
    get itemStack() { return this._itemStack; }

    /**
     * @type {string}
     */
    get id() { return this._itemStack.id; }

}

export default ItemStackEntity;