
export class WaitAction {
    static KEY = 'wait';
    private static RESERVED = 'reserved';
    static run(creep:Creep) {
        if (creep.memory['wait'] === WaitAction.RESERVED && creep.room.controller &&
                ((creep.room.controller.reservation && creep.room.controller.reservation.username === Memory['username']) ||
                creep.room.controller.my)) {
            delete creep.memory['wait'];
            creep.setNextAction();
        } else if (creep.memory['wait']) {
            creep.setNextAction();
        }
    }

    static setActionUntilReserved(creep:Creep) {
        creep.memory['action'] = 'wait';
        creep.memory['wait'] = WaitAction.RESERVED;
        creep.say('🕙 reserved');
    }

    static setActionUntilNextTick(creep: Creep) {
        creep.memory['action'] = 'wait';
        creep.memory['wait'] = true;
        creep.say('🕙 idle');
    }

    static setActionPermenantly(creep: Creep) {
        delete creep.memory['wait'];
        creep.memory['action'] = 'wait';
        creep.say('Zz sleep');
    }
}