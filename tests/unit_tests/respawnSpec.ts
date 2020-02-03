import {Respawn} from "../../src/respawn";

describe("Respawn Tests", function() {

    beforeEach(function() {
        require('../mocks/game')();
        Game.spawns['Spawn1'].room.energyAvailable = 200;
        Game.spawns['Spawn1'].room.energyCapacityAvailable = 600;
        Game.getObjectById = function(id) {
            return Game.spawns['Spawn1'];
        }
    });

    test("Respawn should build upgrader if none exist and energy at least 200", function() {
        Respawn.run();
        expect(Game.spawns['Spawn1'].spawning['memory'].role).toBe("upgrader");
    });

    test("Respawn should not build upgrader if one exists", function() {
        Game.spawns['Spawn1'].room['entities'][FIND_CREEPS].push(
            require('../mocks/creep')([MOVE, CARRY, WORK], 'Upgrader1',
                {memory: {role: "upgrader"}}, Game.rooms.Room1)
        );
        Respawn.run();
        expect(Game.spawns['Spawn1'].spawning).toBe(null);
    });
});