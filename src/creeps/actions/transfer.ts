
export class TransferAction {
    static KEY = 'transfer';

    static run(creep:Creep) {
        if (!creep.memory['target']) {
            delete creep.memory['resourceType'];
            creep.setNextAction();
            return;
        }
        let resourceType = RESOURCE_ENERGY;
        if (creep.memory['resourceType']) {
            resourceType = creep.memory['resourceType'];
        }
        let structure:Structure = Game.getObjectById(creep.memory['target']);
        if (!structure || !structure['store'] || structure['store'].getFreeCapacity(resourceType) < 1) {
            if (creep.memory['role'] === 'miner' && creep.room.controller &&
                (creep.room.controller.reservation || !creep.room.controller.my)) {
                creep.memory['role'] = 'homing';
                delete creep.memory['action'];
                delete creep.memory['container'];
                delete creep.memory['source'];
            }

            delete creep.memory['target'];
            delete creep.memory['resourceType'];
            creep.setNextAction();
            return;
        }
        let inMinerRangeOfSource = true;
        let source = null;
        if (creep.memory['source'] && creep.memory['role'] === 'miner') {
            source = Game.getObjectById(creep.memory['source']);
            if (source && source.pos) {
                inMinerRangeOfSource = creep.pos.inRangeTo(source, 1);
            }
        }
        if (!creep.pos.inRangeTo(structure, 1) || (!inMinerRangeOfSource && structure.structureType !== STRUCTURE_LINK)) {
            creep.moveToTarget();
            return;
        }
        creep.transfer(structure, resourceType);
        delete creep.memory['target'];
        delete creep.memory['resourceType'];
        creep.setNextAction();
    }

    static setAction(creep:Creep, target:Structure, resourceType:ResourceConstant) {
        creep.memory['action'] = this.KEY;
        creep.memory['target'] = target.id;
        creep.memory['resourceType'] = resourceType;
        creep.say('⚡ give');
    }
}