import Registry from '../../Registry.js';

/**
 * @class
 */
class TileMap {

    /**
     * @private
     * @type {Map<string, HTMLImageElement>}
     */
    _textures = new Map();

    /**
     * @private
     * @type {Map<string, [number, number, number, number]>}
     */
    _minimapColors = new Map();

    /**
     * @param {Map<string, HTMLImageElement>} textures 
     * @param {Map<string, [number, number, number, number]>} minimapColors
     */
    constructor(textures, minimapColors) { this._textures = textures; this._minimapColors = minimapColors; }

    /**
     * @static
     * @returns {TileMap}
     */
    static async Create() {
        // load textures
        const promises = [];
        const textures = new Map();
        const minimapColors = new Map();

        // ----- //
        // items, tiles, & tile entities
        const sections = ['Items', 'Tiles', 'TileEntities'];
        for (let i = 0; i < sections.length; i++) {
            const section = Registry[sections[i]];
            
            for (const [ id, { texture, minimapColor } ] of Object.entries(section)) {
                promises.push(new Promise(resolve => {
                    const img = new Image();
                    img.onload = resolve;
                    img.src = texture;
                    textures.set(id, img);
                    minimapColors.set(id, minimapColor);
                }));
            }
        }
        //   -   //
        
        // ----- //
        // player
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload = resolve;
            img.src = Registry.Player.texture;
            textures.set('player', img);
        }));

        // selection
        for (const [type, path] of Object.entries(Registry.Player.selection.textures)) {
            promises.push(new Promise(resolve => {
                const img = new Image();
                img.onload = resolve;
                img.src = path;
                textures.set(`player.selection.${type}`, img);
            }));
        }

        // statistics
        const playerStatTextures = ['full', 'half', 'none'];
        for (const [ name, { textures: _textures } ] of Object.entries(Registry.Player.statistics)) {
            for (const playerStat of playerStatTextures) {
                promises.push(new Promise(resolve => {
                    const img = new Image();
                    img.onload = resolve;
                    img.src = _textures[playerStat];
                    textures.set(`player.${name}.${playerStat}`, img);
                }));
            }
        }
        //   -   //

        // ----- //
        // default
        promises.push(new Promise(resolve => {
            const img = new Image();
            img.onload = resolve;
            img.src = Registry.Default.texture;
            textures.set('default', img);
            minimapColors.set('default', Registry.Default.minimapColor);
        }));
        //   -   //

        await Promise.all(promises);
        return new TileMap(textures, minimapColors);
    }

    /**
     * @param {string} id 
     * @returns {HTMLImageElement}
     */
    get(id) { return this._textures.has(id) ? this._textures.get(id) : this._textures.get('default'); }

    /**
     * @param {string} id 
     * @returns {[number, number, number, number]}
     */
    getColor(id) { return this._minimapColors.has(id) ? this._minimapColors.get(id) : this._minimapColors.get('default'); }

    sample(value, seaLevel=-0.125) {
        const belowSeaLevel = Math.abs(-1 - seaLevel);
        const aboveSeaLevel = Math.abs(seaLevel - 1);
        const ranges = [
            { min: -1.0, max: -1.0 + (belowSeaLevel * 0.5), texture: 'tile.water.deep' },
            { min: -1.0 + (belowSeaLevel * 0.5), max: -1.0 + belowSeaLevel, texture: 'tile.water.shallow' },
            { min: -1.0 + belowSeaLevel, max: -1.0 + belowSeaLevel + (aboveSeaLevel * 0.125), texture: 'tile.beach' },
            { min: -1.0 + belowSeaLevel + (aboveSeaLevel * 0.125), max: -1.0 + belowSeaLevel + (aboveSeaLevel * 0.5), texture: 'tile.plains' },
            { min: -1.0 + belowSeaLevel + (aboveSeaLevel * 0.5), max: 1.0, texture: 'tile.forest' }
        ];
        for (let range of ranges) { if (value >= range.min && value < range.max) return range.texture; }
    }

}

export default TileMap;