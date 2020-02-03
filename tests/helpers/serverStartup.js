let fs = require('fs');
const path = require('path');
const file = fs.readFileSync(path.resolve(__dirname, '../../integTest/main.js'));
const _ = require('lodash');

module.exports = {
    terrainNormal: async function(server, options) {
        const { TerrainMatrix } = require('screeps-server-mockup');

        const terrain = new TerrainMatrix();
        const walls = [[10, 10], [10, 40], [40, 10], [40, 40]];
        _.each(walls, ([x, y]) => terrain.set(x, y, 'wall'));

        await server.world.addRoom('W0N1');
        await server.world.setTerrain('W0N1', terrain);
        await server.world.addRoomObject('W0N1', 'controller', 10, 10,
            { level: options && options.controllerLevel ? options.controllerLevel : 0 });
        await server.world.addRoomObject('W0N1', 'source', 10, 40, { energy: 1000, energyCapacity: 1000, ticksToRegeneration: 300 });
        await server.world.addRoomObject('W0N1', 'mineral', 40, 40, { mineralType: 'H', density: 3, mineralAmount: 3000 });
        _.forEach(options.creeps, (creep) => {
            server.world.addRoomObject('W0N1', 'creep', creep.pos.x, creep.pos.y, creep);
        });
        _.forEach(options.structures, (structure) => {
            server.world.addRoomObject('W0N1', 'structure', structure.pos.x, structure.pos.y, structure);
        });
    },
    terrainEdgy: function(server, options) {

    },
    terrainCrowded: function(server, options) {

    },
    terrainSwampy: function(server, options) {

    },

    runServer: async function(server, callbacks, options, tickCallback, finalCallback) {

        try {
            await server.world.reset(); // reset world but add invaders and source keepers bots

            _.forEach(callbacks, (callback) => {
                callback(server, options);
            });

            const modules = {
                main: file.toString(),
            };
            const bot = await server.world.addBot({ username: 'bot', room: 'W0N1', x: 25, y: 25, modules });

            // Print console logs every tick
            bot.on('console', (logs, results, userid, username) => {
                _.each(logs, line => console.log(`[console|${username}]`, line));
            });

            // Start server and run several ticks
            await server.start();
            for (let i = 0; i < options.ticks; i += 1) {
                console.log('[tick]', await server.world.gameTime);
                await server.tick();
                _.each(await bot.newNotifications, ({ message }) => console.log('[notification]', message));
                console.log('[memory]', await bot.memory, '\n');
                if (tickCallback) {
                    tickCallback(server.world);
                }
            }

            if (finalCallback) {
                finalCallback(server.world);
            }
        } catch (err) {
            // console.error(err);
        } finally {
            // Stop server and disconnect storage
            // process.exit();
        }
    }
};