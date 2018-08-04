let upgraderScript = require('../../src/roles/role.upgrader');
let Util = require('../../src/util');

describe("Upgrader Tests", function() {
    let upgrader1 = null;

    beforeEach(function() {
        require('../mocks/game')();
        upgrader1 = require('../mocks/creep')([MOVE, WORK, CARRY], "Upgrader1", {memory: {role: 'upgrader'}}, Game.rooms.Room1);
        upgrader1.carry.energy = 50;
        Game.creeps['Upgrader1'] = upgrader1;
    });

    it("Upgrader should empty its energy before harvesting", function() {
        upgrader1.carry.energy = 100;
        upgrader1.carryCapacity = 150;
        upgrader1.memory.upgrading = true;
        upgraderScript.run(upgrader1);
        expect(upgrader1.memory.upgrading).toBe(true);
    });

    it("Upgrader should fill its energy before stopping harvesting", function() {
        upgrader1.carry.energy = 8;
        Game.rooms.Room1.entities[FIND_SOURCES].push(
            require('../mocks/source')("Source1",0,1,Game.rooms.Room1)
        );
        upgrader1.carryCapacity = 100;
        upgraderScript.run(upgrader1);
        expect(upgrader1.memory.upgrading).toBe(undefined);
    });

    it("Upgrader should upgrade controller if full", function() {
        Game.rooms.Room1.entities[FIND_SOURCES].push(
            require('../mocks/source')("Source1",0,1,Game.rooms.Room1)
        );
        upgrader1.memory.currentOrder = Util.HARVEST + ":Source1";
        upgrader1.carry.energy = 100;
        upgrader1.carryCapacity = 100;
        upgraderScript.run(upgrader1);
        expect(upgrader1.memory.upgrading).toBe(true);
    });
});