import Registry from '../../Registry.js';
import Vector2 from '../../util/Vector2.js';
import Inventory from '../item/Inventory.js';
import ItemStack from '../item/ItemStack.js';

/**
 * @typedef {import('../../util/Vector2.js').Vector2} Vector2
 * @typedef {import('../../Registry.js').RegistryRecipe} RegistryRecipe
 */

/**
 * @class
 */
class CraftingGrid extends Inventory {

    /**
     * @private
     * @type {ItemStack|null}
     */
    _output = null;

    /**
     * @private
     * @type {RegistryRecipe|null}
     */
    _currentRecipe = null;

    /**
     * @private
     * @type {() => void|null}
     */
    _consumeCallback = null;

    /**
     * @param {Vector2} size
     */
    constructor(size=Vector2(2, 2)) {
        super(size);
    }

    /**
     * @type {Vector2}
     */
    get size() { return super.size; }

    /**
     * @param {Vector2} s
     */
    set size(s) {
        this.clear();
        this._size = s;
        const newItemStacks = [];
        this._itemStacks = [];
        for (let x = 0; x < this._size.x; x++) {
            newItemStacks[x] = [];
            for (let y = 0; y < this._size.y; y++) {
                newItemStacks[x][y] = this._itemStacks[x]?.[y] ?? null;
            }
        }
        this._itemStacks = newItemStacks;
    }

    get output() { return this._output; }

    /**
     * @returns {void}
     */
    clear() {
        super.clear();
        this._output = null;
    }

    /**
     * @returns {void}
     */
    consume() {
        if (this._consumeCallback) this._consumeCallback();
        this._consumeCallback = null;
    }

    /**
     * @returns {void}
     */
    update() {
        this._updateRecipe();
    }

    /**
     * @private
     * @returns {void}
     */
    _updateRecipe() {
        this._currentRecipe = this._findRecipe();
        if (this._currentRecipe) this._output = new ItemStack(this._currentRecipe.output.id, this._currentRecipe.output.amount);
        else this._output = null;
    }

    /**
     * @private
     * @param {RegistryRecipe} recipe
     * @returns {boolean}
     */
    _checkRecipe(recipe) {
        if (recipe.type === 'shaped') {
            const pattern = recipe.pattern;
    
            for (let row = 0; row < this._size.y; row++) {
                for (let col = 0; col < this._size.x; col++) {
                    let match = true;
    
                    for (let i = 0; i < pattern.length; i++) {
                        for (let j = 0; j < pattern[i].length; j++) {
                            const patternSymbol = pattern[i][j];
    
                            if (patternSymbol) {
                                const ingredient = recipe.key[patternSymbol];
                                const gridRow = row + i;
                                const gridCol = col + j;
    
                                if (gridRow >= this._size.y || gridCol >= this._size.x || !this._itemStacks[gridCol] || !this._itemStacks[gridCol][gridRow]) {
                                    match = false;
                                    break;
                                }
    
                                const item = this.get(Vector2(gridCol, gridRow));
                                if (!item || item.id !== ingredient.id || item.count < ingredient.amount) {
                                    match = false;
                                    break;
                                }
                            }
                        }
    
                        if (!match) break;
                    }
    
                    if (match) {
                        this._consumeCallback = () => {
                            for (let i = 0; i < pattern.length; i++) {
                                for (let j = 0; j < pattern[i].length; j++) {
                                    const patternSymbol = pattern[i][j];
    
                                    if (patternSymbol) {
                                        const ingredient = recipe.key[patternSymbol];
                                        const gridRow = row + i;
                                        const gridCol = col + j;

                                        this._itemStacks[gridCol][gridRow].count -= ingredient.amount;
                                        if (this._itemStacks[gridCol][gridRow].count <= 0) this._itemStacks[gridCol][gridRow] = null;
                                    }
                                }
                            }
                            this._output = null;
                        };
                        return true;
                    }
                }
            }
    
            return false;
        }
        else if (recipe.type === 'shapeless') {
            // TODO
        }
        return true;
    }

    /**
     * @private
     * @returns {RegistryRecipe|null}
     */
    _findRecipe() {
        for (let recipe of Registry.Recipes) {
            if (this._checkRecipe(recipe)) return recipe;
        }
        return null;
    }

}

export default CraftingGrid;