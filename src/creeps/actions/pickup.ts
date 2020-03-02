
export class PickupAction {
    static KEY = 'pickup';

    static run(creep:Creep) {
        if (!creep.memory['target']) {
            creep.setNextAction();
            return;
        }
        let targetResource:Resource = Game.getObjectById(creep.memory['target']);
        if (!targetResource || creep.store.getFreeCapacity(targetResource.resourceType) < 1) {
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        if (!creep.pos.inRangeTo(targetResource, 1)) {
            creep.moveToTarget();
            return;
        }
        creep.pickup(targetResource);
    }

    static setAction(creep:Creep, resource:Resource) {
        creep.memory['target'] = resource.id;
        creep.memory['action'] = this.KEY;
        creep.say('⚡ pickup');
    }
}