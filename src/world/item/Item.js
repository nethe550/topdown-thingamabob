/**
 * @class
 */
class Item {

    /**
     * @readonly
     * @type {Map<string, string>}
     */
    static TileEntityToItem = new Map([
        ['default', 'default'],
        ['grass', 'item.fibers'],
        ['stones', 'item.stone'],
        ['large_stone', 'item.stone'],
        ['tree', 'item.wood'],
        ['copper_ore', 'item.copper_ore'],
        ['iron_ore', 'item.iron_ore']
    ]);

    /**
     * @readonly
     * @type {Array<string>}
     */
    static Tools = [
        'item.stone_sword',
        'item.stone_pickaxe',
        'item.copper_sword',
        'item.copper_pickaxe',
        'item.iron_sword',
        'item.iron_pickaxe'
    ];

    /**
     * @readonly
     * @type {{ id: { tileID: number }}}
     */
    static ToolEffectiveness = {
        'hand': { 'grass': 1, 'stones': 1, 'default': 1 },
        'item.stone_sword': { 'grass': 2 },
        'item.stone_pickaxe': { 'large_stone': 5, 'copper_ore': 1 },
        'item.copper_sword': { 'grass': 3 },
        'item.copper_pickaxe': { 'large_stone': 7, 'copper_ore': 2, 'iron_ore': 1 },
        'item.iron_sword': { 'grass': 5 },
        'item.iron_pickaxe': { 'large_stone': 10, 'copper_ore': 3, 'iron_ore': 2 }
    };

    /**
     * @type {string}
     */
    _id = null;

    /**
     * @param {string} id 
     */
    constructor(id) {
        this._id = id;
    }

    get id() { return this._id; }

}

export default Item;