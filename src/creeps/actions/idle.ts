
export class IdleAction {
    static KEY = 'idle';

    static setAction(creep: Creep) {
        creep.memory['action'] = this.KEY;
        creep.say('Zz idle');
    }
}
