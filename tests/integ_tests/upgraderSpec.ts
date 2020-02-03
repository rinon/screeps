import _ from "lodash";

const serverStart = require('../helpers/serverStartup');

describe("Upgrader Tests", function() {
    let server = undefined;

    beforeEach(function () {
        const { ScreepsServer } = require('screeps-server-mockup');
        server = new ScreepsServer();
    });

    afterEach(function() {
        server.stop();
    });

    it("Empty upgrader should start harvesting", async function() {
        let creeps = [
            { name: "Upgrader124", memory: { role: 'upgrader', upgrading: true }, carry: { energy: 0 }, carryCapacity: 300, pos: { x: 25, y: 40 } }
        ];


        await serverStart.runServer(server, [ serverStart.terrainNormal ],
            {controllerLevel: 1, creeps: creeps, ticks: 1 }, null, async (world) => {

                let upgrader = null;
                let sourceId = null;
                let roomObjects = await world.roomObjects('W0N1');
                _.forEach(roomObjects, (obj) => {
                    if (obj.type === 'source') {
                        sourceId = obj._id;
                    }
                    if (obj.memory && obj.memory.role === 'upgrader') {
                        upgrader = obj;
                    }
                });
                if (upgrader == null || sourceId == null) {
                    fail();
                }
                expect(upgrader.memory.upgrading).toBe(false);
            });

    });

    it("Full upgrader should start upgrading", async function() {
        let creeps = [
            { name: "Upgrader1253", memory: { role: 'upgrader', upgrading: false }, carry: { energy: 300 }, carryCapacity: 300, pos: { x: 15, y: 40 } }
        ];


        await serverStart.runServer(server, [ serverStart.terrainNormal ],
            {controllerLevel: 1, creeps: creeps, ticks: 1 }, async (world) => {
                let upgrader = null;
                let controllerId = null;
                let roomObjects = await world.roomObjects('W0N1');
                _.forEach(roomObjects, (obj) => {
                    if (obj.type === 'controller') {
                        controllerId = obj._id;
                    }
                    if (obj.memory && obj.memory.role === 'upgrader') {
                        upgrader = obj;
                    }
                });

                if (upgrader == null || controllerId == null) {
                    fail();
                }
                expect(upgrader.memory.upgrading).toBe(true);
            });
    });
});