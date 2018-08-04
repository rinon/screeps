let Util = require('./util');

let roleUpgrader = {

    run: function(creep) {
        if(creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.currentOrder = Util.MOVE + ":" + creep.room.controller.id;
            } else {
                creep.memory.currentOrder = Util.UPGRADE_CONTROLLER + ":" + creep.room.controller.id;
            }
        }
        else {
            let container = Util.checkIfInUse(creep.room, FIND_STRUCTURES, creep, Util.WITHDRAW,
                (structure) => { return structure.structureType === STRUCTURE_CONTAINER &&
                    structure.store.energy > 0; });
            if (container !== undefined) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + container.id;
                } else {
                    creep.memory.currentOrder = Util.WITHDRAW + ":" + container.id;
                }
            } else {
                let targetSource = Util.checkIfInUse(creep.room, FIND_SOURCES, creep, Util.HARVEST);
                if (targetSource !== undefined) {
                    if (creep.harvest(targetSource) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetSource, {visualizePathStyle: {stroke: '#ffaa00'}});
                        creep.memory.currentOrder = Util.MOVE + ":" + targetSource.id;
                    } else {
                        creep.memory.currentOrder = Util.HARVEST + ":" + targetSource.id;
                    }
                } else {
                    creep.memory.currentOrder = undefined;
                }
            }
        }
    }
};

module.exports = roleUpgrader;