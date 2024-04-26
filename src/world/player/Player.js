import Registry from '../../Registry.js';
import Vector2 from '../../util/Vector2.js';
import PlayerInventory from './PlayerInventory.js';

/**
 * @typedef {import('../../util/Vector2.js').Vector2} Vector2
 * @typedef {import('../World.js').default} World
 * 
 * @typedef {{ current: number, max: number }} PlayerStatistic
 * @typedef {{ moving: number, movingSprintMultiplier: number }} PlayerHungerConsumption
 * @typedef {{ sprint: number }} PlayerStaminaConsumption
 * @typedef {{ starving: { min: number, speed: number }}} PlayerHealthConsumption
 * 
 * @typedef {{ minHunger: number }} PlayerSprintSettings
 * @typedef {{ sprinting: boolean, settings: PlayerSprintSettings }} PlayerSprintState
 * 
 * @typedef {{ state: PlayerStatistic, regenerationDelay: number, regenerationAmount: number, consumption: PlayerStaminaConsumption, currentRegenerationTime: number }} PlayerStaminaStatistic
 * @typedef {{ state: PlayerStatistic, consumption: PlayerHealthConsumption }} PlayerHealthStatistic
 * @typedef {{ state: PlayerStatistic, consumption: PlayerHungerConsumption }} PlayerHungerStatistic
 */

/**
 * @class
 */
class Player extends EventTarget {

    /**
     * @readonly
     * @type {{ normal: number, tiles: { tileID: number } }}
     */
    static Speed = {
        normal: 0.05,
        sprintMultiplier: 1.5,
        tiles: {
            'water.shallow': 0.025,
            'water.deep': 0.0125
        },
        get: (tileID, sprinting=false) => (Player.Speed.tiles[tileID] ? Player.Speed.tiles[tileID] : Player.Speed.normal) * ((Number(sprinting) + 1) * Player.Speed.sprintMultiplier)
    };

    /**
     * @param {number} current 
     * @param {number} max 
     * @returns {PlayerHealthStatistic}
     */
    static HealthStatistic = (current=20, max=20, consumption={ starving: { min: 1, speed: 1 }}) => {
        return {
            state: { current: current, max: max },
            consumption: consumption
        };
    };

    /**
     * @param {number} current 
     * @param {number} max 
     * @param {number} regenerationDelay 
     * @param {number} regenerationAmount 
     * @param {PlayerStaminaConsumption} consumption 
     * @returns {PlayerStaminaStatistic}
     */
    static StaminaStatistic = (current=20, max=20, regenerationDelay=1000, regenerationAmount=2.5, consumption={ sprint: 5 }) => {
        return {
            state: { current: current, max: max },
            regenerationDelay: regenerationDelay,
            regenerationAmount: regenerationAmount,
            consumption: consumption,
            currentRegenerationTime: 0
        };
    };

    /**
     * @param {number} current 
     * @param {number} max 
     * @param {PlayerHungerConsumption} consumption 
     * @returns {PlayerHungerStatistic}
     */
    static HungerStatistic = (current=20, max=20, consumption={ moving: 0.05, movingSprintMultiplier: 2 }) => {
        return {
            state: { current: current, max: max },
            consumption: consumption
        };
    };

    /* ==================== */
    // Global

    /**
     * @type {string}
     */
    name = 'Player';

    /* ==================== */
    // Current State

    /**
     * @type {Vector2}
     */
    position = Vector2(0, 0);

    /**
     * @type {Vector2}
     */
    targetPosition = Vector2(0, 0);

    /**
     * @type {{ position: Vector2, maxDistance: number }}
     */
    selection = { position: Vector2(0, 0), maxDistance: 5 };

    /* ==================== */
    // Statistics

    /**
     * @type {PlayerHealthStatistic}
     */
    health = Player.HealthStatistic();

    /**
     * @type {PlayerStaminaStatistic}
     */
    stamina = Player.StaminaStatistic();

    /**
     * @type {PlayerHungerStatistic}
     */
    hunger = Player.HungerStatistic();

    /**
     * @type {PlayerSprintState}
     */
    sprint = { sprinting: false, settings: { minHunger: 3 } };

    /**
     * @type {PlayerInventory}
     */
    inventory = null;

    /**
     * @type {Array<Vector2>}
     */
    workbenchCache = [];

    /**
     * @param {string} name
     * @param {Vector2} position
     * @param {number} maxSelectionDistance
     * @param {PlayerHealthStatistic} health
     * @param {PlayerStaminaStatistic} stamina
     * @param {PlayerHungerStatistic} hunger
     * @param {PlayerSprintSettings} sprintSettings
     * @param {Vector2} inventorySize
     */
    constructor(name, position, maxSelectionDistance, health, stamina, hunger, sprintSettings, inventorySize) {
        super();
        this.name = name;
        
        this.position = position;
        this.targetPosition = { x: position.x, y: position.y };
        this.selection = { position: Vector2(0, 0), maxDistance: maxSelectionDistance };
        
        this.health = health;
        this.stamina = stamina;
        this.hunger = hunger;
        
        this.sprint = {
            sprinting: false,
            settings: sprintSettings
        };

        this.inventory = new PlayerInventory(inventorySize);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {World} world
     * @returns {void}
     */
    moveTarget(x, y, world) {
        const newPos = Vector2(this.targetPosition.x + x, this.targetPosition.y + y);
        const newTile = newPos.x >= 0 && newPos.x < world.width && newPos.y >= 0 && newPos.y < world.height ? world.get(newPos) : null;
        if (newTile !== null) {
            if (newTile.entity !== null ? !Registry.TileEntities[newTile.entity.id]?.collision : true) this.targetPosition.x = newPos.x;
            if (newTile.entity !== null ? !Registry.TileEntities[newTile.entity.id]?.collision : true) this.targetPosition.y = newPos.y;
        }
    }

    /**
     * @param {Vector2} size 
     * @returns {boolean}
     */
    selectionInWorld(size) { return this.selection.position.x >= 0 && this.selection.position.x < size.x && this.selection.position.y >= 0 && this.selection.position.y < size.y; }

    /**
     * @param {Vector2}
     * @returns {boolean}
     */
    selectionReachable(worldSize) { return this.selectionInWorld(worldSize) && Math.sqrt((this.selection.position.x - this.position.x) ** 2 + (this.selection.position.y - this.position.y) ** 2) <= this.selection.maxDistance; }

    /**
     * @param {number} dt
     * @param {World} world
     * @returns {{ playerStatisticsInvalid: boolean }}
     */
    update(dt, world) {

        this.sprint.sprinting &&= this.hunger.state.current >= this.sprint.settings.minHunger;

        // ------------------------- //
        // position interpolation

        const delta = Vector2(
            this.targetPosition.x - this.position.x,
            this.targetPosition.y - this.position.y
        );
        const moving = Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0;
        const distance = Math.sqrt(delta.x ** 2 + delta.y ** 2);
        
        const tileID = world.get(this.targetPosition).id;
        if (distance > (this.sprint.sprinting ? Player.Speed.sprintMultiplier * 0.1 : 0.1)) {
            const speed = Player.Speed.get(tileID, this.sprint.sprinting && this.stamina.state.current > 0);
            this.position.x += (delta.x / distance) * speed;
            this.position.y += (delta.y / distance) * speed;
        }
        else {
            this.position.x = this.targetPosition.x;
            this.position.y = this.targetPosition.y;
        }

        // ------------------------- //
        // statistics

        const dtn = dt * 0.001;

        // stamina
        let playerStatisticsInvalid = false;
        {
            const prevStamina = this.stamina.state.current;

            // sprint
            if (this.sprint.sprinting && this.stamina.consumption.sprint !== 0) {
                if (moving && this.stamina.state.current > 0 && this.stamina.currentRegenerationTime >= this.stamina.regenerationDelay) {
                    this.stamina.state.current = Math.max(this.stamina.state.current - this.stamina.consumption.sprint * dtn, 0);
                    if (this.stamina.state.current === 0) {
                        this.sprint.sprinting = false;
                        this.stamina.currentRegenerationTime = 0;
                    }
                }
            }
            
            // regenerate
            if (this.stamina.state.current !== this.stamina.state.max && this.stamina.currentRegenerationTime >= this.stamina.regenerationDelay) this.stamina.state.current = Math.min(this.stamina.state.current + this.stamina.regenerationAmount * dtn, this.stamina.state.max);
            this.stamina.currentRegenerationTime += dt;

            playerStatisticsInvalid ||= prevStamina != this.stamina.state.current;
        }

        // hunger
        {
            const prevHunger = this.hunger.state.current;
            if (this.hunger.consumption.moving !== 0 && moving) this.hunger.state.current = Math.max(this.hunger.state.current - this.hunger.consumption.moving * (this.sprint.sprinting ? this.hunger.consumption.movingSprintMultiplier : 1) * dtn, 0);

            playerStatisticsInvalid ||= prevHunger != this.hunger.state.current;
        }

        // health
        {
            const prevHealth = this.health.state.current;
            if (this.hunger.state.current === 0 && this.health.state.current > this.health.consumption.starving?.min + 1) this.health.state.current = Math.max(this.health.state.current - this.health.consumption.starving.speed * dtn, 0);

            playerStatisticsInvalid ||= prevHealth != this.health.state.current;
        }

        // workbench radius
        let inWorkbenchRange = false;
        for (let workbench of this.workbenchCache) {
            if (Math.sqrt((this.position.x - workbench.x) ** 2 + (this.position.y - workbench.y) ** 2) <= this.selection.maxDistance) {
                if (this.inventory.craftingGrid.size.x !== 3 || this.inventory.craftingGrid.size.y !== 3) this.inventory.craftingGrid.size = Vector2(3, 3);
                this.dispatchEvent(new Event('inventoryChanged'));
                inWorkbenchRange = true;
                break;
            } 
        }
        if (!inWorkbenchRange && (this.inventory.craftingGrid.size.x !== 2 || this.inventory.craftingGrid.size.y !== 2)) {
            this.inventory.craftingGrid.size = Vector2(2, 2);
            this.dispatchEvent(new Event('inventoryChanged'));
        }

        return {
            playerStatisticsInvalid: playerStatisticsInvalid
        };
    }

}

export default Player;