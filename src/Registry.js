import Vector2 from './util/Vector2.js';

/**
 * @typedef {import('./util/Vector2.js').Vector2} Vector2
 * @typedef {import('./dom/Renderer.js').ZoomSettings} RendererZoomSettings
 * @typedef {{ position: Vector2, scale: Vector2 }} RendererMinimapSettings
 * @typedef {{ scale: number, padding: Vector2, iconsPerRow: number }} RendererPlayerStatisticSettings
 * @typedef {{ slotSize: number, slotScale: number, padding: Vector2 }} RendererPlayerInventorySettings
 * 
 * @typedef {{ element: HTMLCanvasElement|string, autoResize: boolean }} RegistryDOMEntry
 * @typedef {{ texture: string, minimapColor: [number, number, number, number] }} RegistryDefaultEntry
 * @typedef {{ toolID: { usage: { tileEntityID: { canUse: boolean, effectiveness: number } } } }} RegistryToolsEntry
 * @typedef {{ itemID: { texture: string, minimapColor: [number, number, number, number] } }} RegistryItemsEntry
 * @typedef {{ tileID: { texture: string, minimapColor: [number, number, number, number] } }} RegistryTilesEntry
 * @typedef {{ entityID: { texture: string, minimapColor: [number, number, number, number], collision: boolean, height: { value: number, random: { enabled: boolean, min: number, max: number }}, randomizedPosition: { enabled: boolean, seed: Vector2, tl: Vector2, br: Vector2 } }, item: string }} RegistryTileEntityEntry
 * @typedef {{ size: Vector2, generation: { entities: { entityID: string } }, itemStackSize: { itemID: number } }} RegistryWorldEntry
 * @typedef {{ id: string, amount: number }} RegistryItemStack
 * @typedef {{ type: string, pattern: Array<string>, key: { placeholder: RegistryItemStack }, output: RegistryItemStack }} RegistryRecipe
 * 
 * @typedef {{ textures: { full: string, half: string, none: string }, max: number, consumption: { starving: { min: number, speed: 1 } } }} RegistryPlayerHealthStatisticEntry
 * @typedef {{ textures: { full: string, half: string, none: string }, max: number, consumption: { sprint: number }, regeneration: { delay: number, amount: number } }} RegistryPlayerStaminaStatisticEntry
 * @typedef {{ textures: { full: string, half: string, none: string }, max: number, consumption: { moving: number, movingSprintMultiplier: number } }} RegistryPlayerHungerStatisticEntry
 * @typedef {{ name: string, position: { centered: boolean, forceOnLand: boolean, position: Vector2 }, sprintSettings: { minHunger: number } texture: string, selection: { textures: { default: string, reachable: string } }, statistics: { health: RegistryPlayerHealthStatisticEntry, stamina: RegistryPlayerStaminaStatisticEntry, hunger: RegistryPlayerHungerStatisticEntry } }} RegistryPlayerEntry
 * @typedef {{ zoomSettings: RendererZoomSettings, minimapSettings: RendererMinimapSettings, playerStatisticSettings: RendererPlayerStatisticSettings, playerInventorySettings: RendererPlayerInventorySettings }}
 */

/**
 * @readonly
 * @type {{ DOM: RegistryDOMEntry, Default: RegistryDefaultEntry, Tools: RegistryToolsEntry, Items: RegistryItemsEntry, Tiles: RegistryTilesEntry, TileEntities: RegistryTileEntityEntry, World: RegistryWorldEntry, Player: RegistryPlayerEntry, Renderer: RegistryRendererEntry, Recipes: Array<RegistryRecipe> }}}
 */
const Registry = {
    DOM: {
        element: '#display',
        autoResize: true,
    },
    Default: {
        texture: './assets/default.png',
        minimapColor: [ 255, 0, 255, 255 ],
    },
    Tools: {
        'hand': {
            usage: {
                'tile.entity.workbench':   { canUse: false, effectiveness:  0 },
                'tile.entity.stick':       { canUse:  true, effectiveness:  1 },
                'tile.entity.stones':      { canUse:  true, effectiveness:  1 },
                'tile.entity.large_stone': { canUse: false, effectiveness:  0 },
                'tile.entity.tree':        { canUse: false, effectiveness:  0 },
                'tile.entity.grass':       { canUse: false, effectiveness:  0 },
                'tile.entity.copper_ore':  { canUse: false, effectiveness:  0 },
                'tile.entity.iron_ore':    { canUse: false, effectiveness:  0 },
            }
        },

        // tier 0
        'item.stone_knife': {
            usage: {
                'tile.entity.workbench':   { canUse: false, effectiveness:  0 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse: false, effectiveness:  0 },
                'tile.entity.large_stone': { canUse: false, effectiveness:  0 },
                'tile.entity.tree':        { canUse: false, effectiveness:  0 },
                'tile.entity.grass':       { canUse:  true, effectiveness:  1 },
                'tile.entity.copper_ore':  { canUse: false, effectiveness:  0 },
                'tile.entity.iron_ore':    { canUse: false, effectiveness:  0 },
            }
        },

        // tier 1
        'item.stone_sword': {
            usage: {
                'tile.entity.workbench':   { canUse: false, effectiveness:  0 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse: false, effectiveness:  0 },
                'tile.entity.large_stone': { canUse: false, effectiveness:  0 },
                'tile.entity.tree':        { canUse: false, effectiveness:  0 },
                'tile.entity.grass':       { canUse:  true, effectiveness:  3 },
                'tile.entity.copper_ore':  { canUse: false, effectiveness:  0 },
                'tile.entity.iron_ore':    { canUse: false, effectiveness:  0 },
            }
        },
        'item.stone_pickaxe': {
            usage: {
                'tile.entity.workbench':   { canUse: false, effectiveness:  0 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse:  true, effectiveness:  2 },
                'tile.entity.large_stone': { canUse:  true, effectiveness:  5 },
                'tile.entity.tree':        { canUse: false, effectiveness:  0 },
                'tile.entity.grass':       { canUse: false, effectiveness:  0 },
                'tile.entity.copper_ore':  { canUse:  true, effectiveness:  1 },
                'tile.entity.iron_ore':    { canUse: false, effectiveness:  0 },
            }
        },
        'item.stone_axe': {
            usage: {
                'tile.entity.workbench':   { canUse:  true, effectiveness:  1 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse: false, effectiveness:  0 },
                'tile.entity.large_stone': { canUse: false, effectiveness:  0 },
                'tile.entity.tree':        { canUse:  true, effectiveness:  1 },
                'tile.entity.grass':       { canUse: false, effectiveness:  0 },
                'tile.entity.copper_ore':  { canUse: false, effectiveness:  0 },
                'tile.entity.iron_ore':    { canUse: false, effectiveness:  0 },
            }
        },

        // tier 2
        'item.copper_sword': {
            usage: {
                'tile.entity.workbench':   { canUse: false, effectiveness:  0 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse: false, effectiveness:  0 },
                'tile.entity.large_stone': { canUse: false, effectiveness:  0 },
                'tile.entity.tree':        { canUse: false, effectiveness:  0 },
                'tile.entity.grass':       { canUse:  true, effectiveness:  3 },
                'tile.entity.copper_ore':  { canUse: false, effectiveness:  0 },
                'tile.entity.iron_ore':    { canUse: false, effectiveness:  0 },
            }
        },
        'item.copper_pickaxe': {
            usage: {
                'tile.entity.workbench':   { canUse: false, effectiveness:  0 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse:  true, effectiveness:  3 },
                'tile.entity.large_stone': { canUse:  true, effectiveness:  7 },
                'tile.entity.tree':        { canUse: false, effectiveness:  0 },
                'tile.entity.grass':       { canUse: false, effectiveness:  0 },
                'tile.entity.copper_ore':  { canUse:  true, effectiveness:  2 },
                'tile.entity.iron_ore':    { canUse:  true, effectiveness:  1 },
            }
        },
        'item.copper_axe': {
            usage: {
                'tile.entity.workbench':   { canUse:  true, effectiveness:  1 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse: false, effectiveness:  0 },
                'tile.entity.large_stone': { canUse: false, effectiveness:  0 },
                'tile.entity.tree':        { canUse:  true, effectiveness:  3 },
                'tile.entity.grass':       { canUse: false, effectiveness:  0 },
                'tile.entity.copper_ore':  { canUse: false, effectiveness:  0 },
                'tile.entity.iron_ore':    { canUse: false, effectiveness:  0 },
            }
        },

        // tier 3
        'item.iron_sword': {
            usage: {
                'tile.entity.workbench':   { canUse: false, effectiveness:  0 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse: false, effectiveness:  0 },
                'tile.entity.large_stone': { canUse: false, effectiveness:  0 },
                'tile.entity.tree':        { canUse: false, effectiveness:  0 },
                'tile.entity.grass':       { canUse:  true, effectiveness:  6 },
                'tile.entity.copper_ore':  { canUse: false, effectiveness:  0 },
                'tile.entity.iron_ore':    { canUse: false, effectiveness:  0 },
            }
        },
        'item.iron_pickaxe': {
            usage: {
                'tile.entity.workbench':   { canUse: false, effectiveness:  0 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse:  true, effectiveness:  3 },
                'tile.entity.large_stone': { canUse:  true, effectiveness: 16 },
                'tile.entity.tree':        { canUse: false, effectiveness:  0 },
                'tile.entity.grass':       { canUse: false, effectiveness:  0 },
                'tile.entity.copper_ore':  { canUse:  true, effectiveness:  4 },
                'tile.entity.iron_ore':    { canUse:  true, effectiveness:  2 },
            }
        },
        'item.iron_axe': {
            usage: {
                'tile.entity.workbench':   { canUse:  true, effectiveness:  1 },
                'tile.entity.stick':       { canUse: false, effectiveness:  0 },
                'tile.entity.stones':      { canUse: false, effectiveness:  0 },
                'tile.entity.large_stone': { canUse: false, effectiveness:  0 },
                'tile.entity.tree':        { canUse:  true, effectiveness:  6 },
                'tile.entity.grass':       { canUse: false, effectiveness:  0 },
                'tile.entity.copper_ore':  { canUse: false, effectiveness:  0 },
                'tile.entity.iron_ore':    { canUse: false, effectiveness:  0 },
            }
        },
    },
    Items: {
        // workstations
        'item.workbench': {
            texture: './assets/item/entity/workbench.png',
            minimapColor: [ 63, 31, 127, 255 ],
            placeInWorld: {
                type: 'entity',
                entity: 'tile.entity.workbench',
            },
        },

        // raw materials
        'item.stone': {
            texture: './assets/item/entity/stone.png',
            minimapColor: [ 33, 33, 33, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.wood': {
            texture: './assets/item/entity/wood.png',
            minimapColor: [ 120, 90, 50, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.fibers': {
            texture: './assets/item/entity/fibers.png',
            minimapColor: [ 60, 120, 20, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.copper_ore': {
            texture: './assets/item/entity/copper_ore.png',
            minimapColor: [ 63, 31, 31, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.iron_ore': {
            texture: './assets/item/entity/iron_ore.png',
            minimapColor: [ 31, 127, 63, 255 ],
            placeInWorld: { type: 'item' },
        },

        // tools

        // tier 0
        'item.stone_knife': {
            texture: './assets/item/tool/stone/stone_knife.png',
            minimapColor: [ 33, 33, 33, 255 ],
            placeInWorld: { type: 'item' },
        },

        // tier 1
        'item.stone_sword': {
            texture: './assets/item/tool/stone/stone_sword.png',
            minimapColor: [ 33, 33, 33, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.stone_pickaxe': {
            texture: './assets/item/tool/stone/stone_pickaxe.png',
            minimapColor: [ 33, 33, 33, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.stone_axe': {
            texture: './assets/item/tool/stone/stone_axe.png',
            minimapColor: [ 33, 33, 33, 255 ],
            placeInWorld: { type: 'item' },
        },

        // tier 2
        'item.copper_sword': {
            texture: './assets/item/tool/copper/copper_sword.png',
            minimapColor: [ 31, 127, 63, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.copper_pickaxe': {
            texture: './assets/item/tool/copper/copper_pickaxe.png',
            minimapColor: [ 31, 127, 63, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.copper_axe': {
            texture: './assets/item/tool/copper/copper_axe.png',
            minimapColor: [ 33, 33, 33, 255 ],
            placeInWorld: { type: 'item' },
        },

        // tier 3
        'item.iron_sword': {
            texture: './assets/item/tool/iron/iron_sword.png',
            minimapColor: [ 127, 127, 127, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.iron_pickaxe': {
            texture: './assets/item/tool/iron/iron_pickaxe.png',
            minimapColor: [ 127, 127, 127, 255 ],
            placeInWorld: { type: 'item' },
        },
        'item.iron_axe': {
            texture: './assets/item/tool/iron/iron_axe.png',
            minimapColor: [ 33, 33, 33, 255 ],
            placeInWorld: { type: 'item' },
        },
    },
    Tiles: {
        'tile.water.deep': {
            texture: './assets/tile/biome/water.deep.png',
            minimapColor: [ 47, 40, 112, 255 ],
        },
        'tile.water.shallow': {
            texture: './assets/tile/biome/water.shallow.png',
            minimapColor: [ 85, 77, 235, 255 ],
        },
        'tile.beach': {
            texture: './assets/tile/biome/beach.png',
            minimapColor: [ 255, 220, 78, 255 ],
        },
        'tile.plains': {
            texture: './assets/tile/biome/plains.png',
            minimapColor: [ 97, 133, 20, 255 ],
        },
        'tile.forest': {
            texture: './assets/tile/biome/forest.png',
            minimapColor: [ 37, 67, 16, 255 ]
        }
    },
    TileEntities: {
        'tile.entity.stick': {
            texture: './assets/tile/entity/stick.png',
            minimapColor: [ 63, 31, 31, 255 ],
            collision: false,
            height: {
                value: 1,
                random: { 
                    enabled: false,
                    min: 1,
                    max: 1,
                },
            },
            randomizedPosition: { enabled: true, tl: Vector2(0.45, 0.45), br: Vector2(0.55, 0.55) },
            item: 'item.wood',
        },
        'tile.entity.stones': {
            texture: './assets/tile/entity/stones.png',
            minimapColor: [ 33, 33, 33, 255 ],
            collision: false,
            height: {
                value: 1,
                random: {
                    enabled: false,
                    min: 1,
                    max: 1,
                },
            },
            randomizedPosition: { enabled: true, tl: Vector2(0.45, 0.45), br: Vector2(0.55, 0.55) },
            item: 'item.stone',
        },
        'tile.entity.large_stone': {
            texture: './assets/tile/entity/large_stone.png',
            minimapColor: [ 63, 63, 63, 255 ],
            collision: true,
            height: {
                value: 1,
                random: {
                    enabled: false,
                    min: 1,
                    max: 1,
                },
            },
            randomizedPosition: { enabled: true, tl: Vector2(0.45, 0.45), br: Vector2(0.55, 0.55) },
            item: 'item.stone',
        },
        'tile.entity.tree': {
            texture: './assets/tile/entity/tree.png',
            minimapColor: [ 80, 120, 30, 255 ],
            collision: true,
            height: {
                value: 2,
                random: {
                    enabled: true,
                    min: 0.6,
                    max: 1,
                },
            },
            randomizedPosition: { enabled: true, tl: Vector2(0.25, 0.25), br: Vector2(0.75, 0.75) },
            item: 'item.wood',
        },
        'tile.entity.grass': {
            texture: './assets/tile/entity/grass.png',
            minimapColor: [ 100, 150, 50, 255 ],
            collision: false,
            height: {
                value: 1,
                random: {
                    enabled: false,
                    min: 1,
                    max: 1,
                },
            },
            randomizedPosition: { enabled: true, tl: Vector2(0.25, 0.25), br: Vector2(0.75, 0.75) },
            item: 'item.fibers',
        },
        'tile.entity.copper_ore': {
            texture: './assets/tile/entity/copper_ore.png', 
            minimapColor: [ 31, 127, 63, 255 ],
            collision: true,
            height: {
                value: 1,
                random: {
                    enabled: false,
                    min: 1,
                    max: 1,
                },
            },
            randomizedPosition: { enabled: true, tl: Vector2(0.45, 0.45), br: Vector2(0.55, 0.55) },
            item: 'item.copper_ore',
        },
        'tile.entity.iron_ore': {
            texture: './assets/tile/entity/iron_ore.png',
            minimapColor: [ 63, 31, 31, 255 ],
            collision: true,
            height: {
                value: 1,
                random: {
                    enabled: false,
                    min: 1,
                    max: 1,
                },
            },
            randomizedPosition: { enabled: true, tl: Vector2(0.45, 0.45), br: Vector2(0.55, 0.55) },
            item: 'item.iron_ore',
        },
        'tile.entity.workbench': {
            texture: './assets/tile/entity/workbench.png',
            minimapColor: [ 63, 31, 127, 255 ],
            collision: true,
            height: {
                value: 1,
                random: {
                    enabled: false,
                    min: 1,
                    max: 1
                },
            },
            randomizedPosition: { enabled: false, tl: Vector2(0, 0), br: Vector2(0, 0) },
            item: 'item.workbench',
        }
    },
    World: {
        size: Vector2(257, 257),
        generation: {
            entities: {
                'tile.beach': {
                    'tile.entity.stones': 0.05,
                },
                'tile.plains': {
                    'tile.entity.stick': 0.0025,
                    'tile.entity.stones': 0.025,
                    'tile.entity.large_stone': 0.00125,
                    'tile.entity.tree': 0.001,
                    'tile.entity.grass': 0.1,
                    'tile.entity.copper_ore': 0.0075,
                },
                'tile.forest': {
                    'tile.entity.stick': 0.05,
                    'tile.entity.stones': 0.025,
                    'tile.entity.large_stone': 0.00625,
                    'tile.entity.tree': 0.2,
                    'tile.entity.copper_ore': 0.01,
                    'tile.entity.iron_ore': 0.0075
                },
            },
            seaLevel: -0.125,
        },
        itemStackSize: {
            'item.workbench': 1,

            'item.stone': 64,
            'item.fibers': 64,
            'item.wood': 64,
            'item.copper_ore': 64,
            'item.iron_ore': 64,

            'item.stone_knife': 1,
            'item.stone_pickaxe': 1,
            'item.stone_sword': 1,
            'item.stone_axe': 1,
            'item.copper_pickaxe': 1,
            'item.copper_sword': 1,
            'item.copper_axe': 1,
            'item.iron_pickaxe': 1,
            'item.iron_sword': 1,
            'item.iron_axe': 1,
        },
    },
    Player: {
        name: 'Player',
        position: {
            centered: true,
            forceOnLand: true,
            position: Vector2(0, 0)
        },
        sprintSettings: {
            minHunger: 3,
        },
        texture: './assets/player/player.png',
        selection: {
            textures: {
                default: './assets/player/selection/selection_default.png',
                reachable: './assets/player/selection/selection_reachable.png'
            },
            maxSelectionDistance: 5,
        },
        statistics: {
            health: {
                textures: {
                    full: './assets/player/stats/health/full.png',
                    half: './assets/player/stats/health/half.png',
                    none: './assets/player/stats/health/none.png',
                },
                max: 20,
                consumption: {
                    starving: {
                        min: 1,
                        speed: 0.25,
                    },
                },
            },
            stamina: {
                textures: {
                    full: './assets/player/stats/stamina/full.png',
                    half: './assets/player/stats/stamina/half.png',
                    none: './assets/player/stats/stamina/none.png',
                },
                max: 20,
                consumption: {
                    sprint: 5,
                },
                regeneration: {
                    delay: 1000,
                    amount: 2.5,
                },
            },
            hunger: {
                textures: {
                    full: './assets/player/stats/hunger/full.png',
                    half: './assets/player/stats/hunger/half.png',
                    none: './assets/player/stats/hunger/none.png',
                },
                max: 20,
                consumption: {
                    moving: 0.075,
                    movingSprintMultiplier: 2,
                },
            },
        },
    },
    Renderer: {
        zoomSettings: {
            current: 1,
            range: {
                min: 0.5,
                max: 4,
            },
            sensitivity: 0.005,
        },
        minimapSettings: {
            position: Vector2(32, 32),
            scale: Vector2(1, 1),
        },
        playerStatisticSettings: {
            scale: 0.5,
            padding: Vector2(10, 10),
            iconsPerRow: 5,
        },
        playerInventorySettings: {
            slotSize: 1,
            slotScale: 1,
            padding: Vector2(10, 10),
        },
    },
    Recipes: [
        {
            type: 'shaped',
            pattern: [
                'WF',
                'FW',
            ],
            key: {
                'W': { id: 'item.wood', amount: 5 },
                'F': { id: 'item.fibers', amount: 10 },
            },
            output: { id: 'item.workbench', amount: 1 }
        },
        {
            type: 'shaped',
            pattern: [
                'S',
                'W',
            ],
            key: {
                'S': { id: 'item.stone', amount: 5 },
                'W': { id: 'item.wood', amount: 3 },
            },
            output: { id: 'item.stone_knife', amount: 1 },
        },
        {
            type: 'shaped',
            pattern: [
                'S',
                'S',
                'W',
            ],
            key: {
                'S': { id: 'item.stone', amount: 10 },
                'W': { id: 'item.wood', amount: 3 },
            },
            output: { id: 'item.stone_sword', amount: 1 },
        },
        {
            type: 'shaped',
            pattern: [
                'SSS',
                ' W ',
                ' W ',
            ],
            key: {
                'S': { id: 'item.stone', amount: 10 },
                'W': { id: 'item.wood', amount: 4 },
            },
            output: { id: 'item.stone_pickaxe', amount: 1 },
        },
        {
            type: 'shaped',
            pattern: [
                'SS ',
                'SW ',
                ' W ',
            ],
            key: {
                'S': { id: 'item.stone', amount: 5 },
                'W': { id: 'item.wood', amount: 3 },
            },
            output: { id: 'item.stone_axe', amount: 1 },
        },
        {
            type: 'shaped',
            pattern: [
                'C',
                'C',
                'W',
            ],
            key: {
                'C': { id: 'item.copper_ingot', amount: 10 },
                'W': { id: 'item.wood', amount: 3 },
            },
            output: { id: 'item.copper_sword', amount: 1 },
        },
        {
            type: 'shaped',
            pattern: [
                'CCC',
                ' W ',
                ' W ',
            ],
            key: {
                'C': { id: 'item.copper_ingot', amount: 10 },
                'W': { id: 'item.wood', amount: 4 },
            },
            output: { id: 'item.copper_pickaxe', amount: 1 },
        },
        {
            type: 'shaped',
            pattern: [
                'CC ',
                'CW ',
                ' W ',
            ],
            key: {
                'C': { id: 'item.copper_ingot', amount: 5 },
                'W': { id: 'item.wood', amount: 3 },
            },
            output: { id: 'item.copper_axe', amount: 1 },
        },
        {
            type: 'shaped',
            pattern: [
                'I',
                'I',
                'W',
            ],
            key: {
                'I': { id: 'item.iron_ingot', amount: 10 },
                'W': { id: 'item.wood', amount: 3 },
            },
            output: { id: 'item.iron_sword', amount: 1 },
        },
        {
            type: 'shaped',
            pattern: [
                'III',
                ' W ',
                ' W ',
            ],
            key: {
                'I': { id: 'item.iron_ingot', amount: 10 },
                'W': { id: 'item.wood', amount: 4 },
            },
            output: { id: 'item.iron_pickaxe', amount: 1 },
        },
        {
            type: 'shaped',
            pattern: [
                'II ',
                'IW ',
                ' W ',
            ],
            key: {
                'I': { id: 'item.iron_ingot', amount: 5 },
                'W': { id: 'item.wood', amount: 3 },
            },
            output: { id: 'item.iron_axe', amount: 1 },
        },
    ],
};

export default Registry;