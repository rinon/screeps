
export class MoveAction {
    static KEY = 'move';

    private static setNewAction(creep:Creep) {
        delete creep.memory['target'];
        delete creep.memory['destination'];
        creep.setNextAction();
    }

    static run(creep:Creep) {
        if ((!creep.memory['target'] && !creep.memory['destination']) ||
                (creep.memory['destination'] && creep.pos.inRangeTo(creep.memory['destination'], 1))) {
            MoveAction.setNewAction(creep);
            return;
        } else if (creep.memory['target']) {
            let target = Game.getObjectById(creep.memory['target']);
            if (!target || !target['pos'] || creep.pos.inRangeTo(target['pos'], 1)) {
                MoveAction.setNewAction(creep);
                return;
            }
        }
        creep.moveToTarget();
    }

    static setActionPos(creep:Creep, pos:RoomPosition) {
        delete creep.memory['target'];
        creep.memory['destination'] = pos;
        creep.memory['action'] = MoveAction.KEY;
        creep.say('→ move');
    }
    static setActionTarget(creep:Creep, thing:Structure|Creep) {
        delete creep.memory['destination'];
        creep.memory['target'] = thing.id;
        creep.memory['action'] = MoveAction.KEY;
        creep.say('→ move');
    }
}