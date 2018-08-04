const respawn = require('../../src/respawn');

describe("Respawn Tests", function() {

    beforeEach(function() {
        require('../mocks/game')();
        Game.spawns['Spawn1'].room.energyAvailable = 200;
        Game.spawns['Spawn1'].room.energyCapacityAvailable = 600;
        Game.getObjectById = function(id) {
            return Game.spawns['Spawn1'];
        }
    });

    it("Respawn should build upgrader if none exist and energy at least 200", function() {
        respawn.run();
        expect(Game.spawns['Spawn1'].spawning.memory.role).toBe("upgrader");
    });

    it("Respawn should not build upgrader if one exists", function() {
        Game.spawns['Spawn1'].room.entities[FIND_CREEPS].push(
            require('../mocks/creep')([MOVE, CARRY, WORK], 'Upgrader1',
                {memory: {role: "upgrader"}}, Game.rooms.Room1)
        );
        respawn.run();
        expect(Game.spawns['Spawn1'].spawning).toBe(null);
    });
});