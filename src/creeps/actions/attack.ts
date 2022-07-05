
export class AttackAction {
    static KEY = 'attack';

    static run(creep:Creep) {
        if (!creep.memory['target']) {
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        let invader:Creep|Structure = Game.getObjectById(creep.memory['target']) as Creep|Structure;
        if (!invader) {
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        if (!creep.pos.inRangeTo(invader, 1)) {
            creep.moveToTarget();
            return;
        }
        creep.attack(invader);
        creep.moveTo(invader.pos);
    }

    static setAction(creep:Creep, invader:Creep|Structure|PowerCreep) {
        creep.memory['target'] = invader.id;
        creep.memory['action'] = AttackAction.KEY;
        creep.say('✘ attack');
    }
}