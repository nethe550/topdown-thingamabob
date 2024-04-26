/**
 * @typedef {import('./TileEntity.js').default} TileEntity
 * @typedef {import('../item/ItemStackEntity.js').default} ItemEntity
 */

/**
 * @class
 */
class Tile {

    /**
     * @type {string}
     */
    id = null;

    /**
     * @type {TileEntity|ItemEntity}
     */
    entity = null;

    /**
     * @type {number}
     */
    layer = 0;

    /**
     * @param {string} id 
     * @param {TileEntity|ItemEntity} entity 
     * @param {number} layer
     */
    constructor(id, entity, layer=0) {
        this.id = id;
        this.entity = entity;
        this.layer = layer;
    }

    /**
     * @returns {void}
     */
    update() {
        this.entity.update();
    }

}

export default Tile;