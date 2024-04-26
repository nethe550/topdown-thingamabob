import Registry from '../Registry.js';
import Vector2 from '../util/Vector2.js';
import Simplex from '../util/Simplex.js';
import TileMap from './tile/TileMap.js';
import Tile from './tile/Tile.js';
import TileEntity from './tile/TileEntity.js';

/**
 * @typedef {import('../util/Vector2.js').Vector2} Vector2
 * @typedef {import('./item/ItemStackEntity.js').default} ItemEntity
 */

/**
 * @class
 */
class World {

    /**
     * @private
     * @type {number}
     */
    _width = 0;

    /**
     * @private
     * @type {number}
     */
    _height = 0;

    /**
     * @type {Array<Array<Tile>>}
     */
    tiles = [];

    /**a
     * @param {number} width 
     * @param {number} height 
     * @param {TileMap} tilemap
     */
    constructor(width, height, tilemap) {
        this._width = width;
        this._height = height;
        this.tiles = [];
        this.generate(tilemap);
    }

    /**
     * @type {number}
     */
    get width() { return this._width; }

    /**
     * @type {number}
     */
    get height() { return this._height; }

    /**
     * @type {Vector2}
     */
    get size() { return Vector2(this._width, this._height); }

    /**
     * @param {TileMap} tilemap
     * @returns {void}
     */
    generate(tilemap) {
        const randomizedPositions = new Map([
            ['default', [false, Vector2(0, 0), Vector2(0, 0)]],
        ]);
        for (const [id, { randomizedPosition }] of Object.entries(Registry.TileEntities)) {
            randomizedPositions.set(id, [randomizedPosition.enabled, randomizedPosition.tl, Vector2(randomizedPosition.br.x - randomizedPosition.tl.x, randomizedPosition.br.y - randomizedPosition.tl.x)]);
        }

        /**
         * @type {{ biome: Map<string, number> } }}
         */
        const biomeToEntityProbability = {};

        for (const biome of Object.keys(Registry.Tiles)) {
            if (Registry.World.generation.entities[biome]) {
                biomeToEntityProbability[biome] = new Map();
                for (const [entity, probability] of Object.entries(Registry.World.generation.entities[biome])) {
                    biomeToEntityProbability[biome].set(entity, probability);
                }
            }
        }

        const assignEntity = biome => {
            const prn = Math.random();
            let cumulativeProbability = 0;
            if (biomeToEntityProbability[biome]) {
                for (const [entity, probability] of biomeToEntityProbability[biome]) {
                    cumulativeProbability += probability;
                    if (prn < cumulativeProbability) return entity;
                }
            }

            return null;
        };

        const ocean = new Simplex();
        const terrain = new Simplex();
        for (let y = 0; y < this._height; y++) {
            const row = [];
            for (let x = 0; x < this._width; x++) {
                const oceanSample = (ocean.noise(x * 0.00625, y * 0.00625) * 0.5 + 0.5) ** 2 * 2 - 1;
                const terrainSample = Simplex.InterpolatedOctave(terrain, x, y, 5, 1, 0.03125, 0.5, 2) * 0.6 + 0.4;
                const sample = Math.min(Math.max(oceanSample < Registry.World.generation.seaLevel ? terrainSample + oceanSample : terrainSample, -1), 1);
                const sampleID = tilemap.sample(sample, Registry.World.generation.seaLevel);
                const sampleEntity = assignEntity(sampleID);
                if (sampleEntity !== null) {
                    const ehi = Registry.TileEntities[sampleEntity].height;
                    const entityHeight = ehi.random.enabled ? ehi.value * (Math.random() * (ehi.random.max - ehi.random.min) + ehi.random.min) : ehi.value;
                    row.push(
                        new Tile(
                            sampleID,
                            new TileEntity(
                                sampleEntity, 
                                entityHeight > 1 ? 1 : -1,
                                entityHeight,
                                TileEntity.RandomizedPosition(...randomizedPositions.get(sampleEntity), Vector2(Math.random(), Math.random()))
                            ),
                            -3
                        )
                    );
                }
                else {
                    row.push( new Tile( sampleID, null, -2) );
                }
            }
            this.tiles.push(row);
        }
    }

    /**
     * @param {Vector2} p
     * @returns {Tile}
     */
    get(p) { return this.tiles[p.x][p.y]; }

    /**
     * @param {Vector2} p 
     * @param {TileEntity|ItemEntity} e 
     */
    setEntity(p, e) {
        this.tiles[p.x][p.y].entity = e;
    }

}

export default World;