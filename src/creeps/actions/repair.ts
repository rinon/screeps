
export class RepairAction {
    static KEY = 'repair';

    static run(creep:Creep) {
        if (creep.store.getUsedCapacity() === 0 || !creep.memory['target']) {
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        let buildingNeedingRepair:Structure = Game.getObjectById(creep.memory['target']);
        if (!buildingNeedingRepair || (buildingNeedingRepair.hits === buildingNeedingRepair.hitsMax)) {
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        if (!creep.pos.inRangeTo(buildingNeedingRepair, 3)) {
            creep.moveToTarget();
            return;
        }
        creep.repair(buildingNeedingRepair);
    }

    static setAction(creep:Creep, target:Structure) {
        creep.memory['target'] = target.id;
        creep.memory['action'] = this.KEY;
        creep.say('✍ repair');
    }
}