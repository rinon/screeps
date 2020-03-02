
export class BuildAction {
    static KEY = 'build';

    static run(creep:Creep) {
        if (creep.store.getUsedCapacity() === 0 || !creep.memory['target']) {
            delete creep.memory['target'];
            creep.setNextAction();
            return;
        }
        let constructionSite = Game.getObjectById(creep.memory['target']);
        if (!constructionSite || (!constructionSite['progress'] && !constructionSite['progressTotal'])) {
            creep.setNextAction();
            return;
        }
        if (!creep.pos.inRangeTo(<ConstructionSite> constructionSite, 3)) {
            creep.moveToTarget();
            return;
        }
        creep.build(<ConstructionSite> constructionSite);
    }

    static setAction(creep:Creep, target:ConstructionSite) {
        creep.memory['target'] = target.id;
        creep.memory['action'] = this.KEY;
        creep.say('✍ build');
    }
}