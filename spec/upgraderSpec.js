let harvesterScript = require('../src/roles/base-building/role.harvester');
let Util = require('../src/util/util');

describe("Harvester Tests", function() {
    let harvester1 = null;

    beforeEach(function() {
        require('./mocks/game')();
        Game.rooms.Room1.entities.FIND_STRUCTURES = [
            require('./mocks/structuretypes/structure-spawn')('Spawn1', 12, 25, STRUCTURE_SPAWN)
        ];
        harvester1 = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester1", {memory: {role: 'harvester'}}, Game.rooms.Room1);
        harvester1.carry.energy = 50;
        Game.creeps['Harvester1'] = harvester1;
    });

    it("Harvester should move to spawn if no structures need energy", function() {
        harvesterScript.run(harvester1);
        expect(harvester1.memory.currentOrder).toBe("MOVE:Spawn1");
    });

    it("Harvester should prioritize extensions over spawn", function() {
        let extension1 = require('./mocks/structuretypes/structure-extension')('Extension1', 15, 30, STRUCTURE_EXTENSION);
        extension1.energy = 0;
        Game.rooms.Room1.entities.FIND_STRUCTURES.push(extension1);
        harvesterScript.run(harvester1);
        expect(harvester1.memory.currentOrder).toBe("MOVE:Extension1");
    });

    it("Harvester should empty its energy before harvesting", function() {
        harvester1.carry.energy = 100;
        harvester1.carryCapacity = 150;
        harvesterScript.run(harvester1);
        expect(harvester1.memory.currentOrder).toBe("MOVE:Spawn1");
    });

    it("Harvester should fill its energy before stopping harvesting", function() {
        harvester1.carry.energy = 8;
        Game.rooms.Room1.entities.FIND_SOURCES.push(
            require('./mocks/source')("Source1",0,1,Game.rooms.Room1)
        );
        harvester1.carryCapacity = 100;
        harvester1.memory.currentOrder = Util.HARVEST + ":Source1";
        harvesterScript.run(harvester1);
        expect(harvester1.memory.currentOrder).toBe(Util.HARVEST + ":Source1");
    });

    it("Harvester should withdraw from container if possible", function() {
        let container1 = require('./mocks/structuretypes/structure-container')('Container1', 12, 30, STRUCTURE_CONTAINER);
        Game.rooms.Room1.entities.FIND_STRUCTURES.push(container1);
        container1.store = { RESOURCE_ENERGY: 2000 };
        container1.storeCapacity = 2000;
        harvester1.carry.energy = 0;
        harvester1.pos.x=11;
        harvester1.pos.y=29;
        harvesterScript.run(harvester1);
        expect(harvester1.memory.currentOrder).toBe(Util.WITHDRAW + ":Container1");
    });

    // it("Harvester should transfer to a container if spawn is full", function() {
    //     Game.rooms.Room1.entities.FIND_STRUCTURES.push(
    //             require('./mocks/structuretypes/structure-container')('Container1', 12, 30, STRUCTURE_CONTAINER));
    //     harvester.run(harvester1);
    //     expect(harvester1.memory.currentOrder).toBe("MOVE:Container1");
    // });
});