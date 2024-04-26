/**
 * @typedef {import('../../util/Vector2.js').Vector2} Vector2
 * @typedef {{ enabled: boolean, offset: Vector2, range: Vector2, seed: Vector2 } } RandomizedPosition
 */

/**
 * @class
 */
class TileEntity {

    /**
     * @param {boolean} enabled
     * @param {Vector2} offset
     * @param {Vector2} range
     * @param {Vector2} seed
     * @returns {RandomizedPosition}
     */
    static RandomizedPosition = (enabled=false, offset={ x: 0, y: 0 }, range={ x: 0, y: 0 }, seed={ x: Math.random(), y: Math.random() }) => {
        return {
            enabled: enabled,
            offset: offset,
            range: range,
            seed: seed
        };
    }

    /**
     * @private
     * @type {string}
     */
    _id = null;

    /**
     * @type {number}
     */
    layer = 1;

    /**
     * @type {number}
     */
    height = 1;

    /**
     * @type {RandomizedPosition}
     */
    randomizedPosition = TileEntity.RandomizedPosition(false, { x: 0.25, y: 0.25 }, { x: 0.5, y: 0.5 });

    /**
     * @param {string} id 
     * @param {number} layer
     * @param {number} height
     * @param {RandomizedPosition} randomizedPosition
     */
    constructor(id, layer=1, height=1, randomizedPosition=TileEntity.RandomizedPosition(false, { x: 0, y: 0 }, { x: 0, y: 0 })) {
        this._id = id;
        this.layer = layer;
        this.height = height;
        this.randomizedPosition = randomizedPosition;
    }

    get id() { return this._id; }

    /**
     * @returns {void}
     */
    update() {
        // TODO
    }

}

export default TileEntity;