module.exports = function(partArray, name, memory, room) {
    let body = [];
    _.forEach(partArray, (part) => {
        body.push({
            "boost": undefined,
            "type": part,
            "hits": 100,
        });
    });

    let baseCreep = {
        carry: {
            energy: 0
        },
        carryCapacity: 50*getPartCount(CARRY, partArray),
        room: room,
        moveTo: function(entity, options) {
            //x, y or entity
        },
        harvest: function(entity) {
            if (Math.abs(entity.pos.x - this.pos.x) < 2 &&
                    Math.abs(entity.pos.y - this.pos.y) < 2 &&
                    this.room.name === entity.room.name) {
                return OK;
            } else {
                return ERR_NOT_IN_RANGE;
            }
        },
        name: name,
        pos: {
            x: 0,
            y: 0,
            findClosestByRange: function(array) {
                return array[0];
            },
            findClosestByPath: function(array) {
                return array[0];
            }
        },
        body: body,
        fatigue: 0,
        hits: 300 + 10*getPartCount(TOUGH, partArray),
        hitsMax: 300 + 10*getPartCount(TOUGH, partArray),
        id: name,
        my: true,
        owner: { username: 'Multitallented' },
        saying: '',
        spawning: false,
        ticksToLive: 1500,
        attack: function(target) {
            //creep or structure
        },
        attackController: function(controller) {

        },
        build: function(constructionSite) {

        },
        cancelOrder: function(methodName) {
            //name of the method to be cancelled
        },
        claimController: function(controller) {
            //requires global control level
        },
        dismantle: function(structure) {

        },
        drop: function(resource) {

        },
        generateSafeMode: function(controller) {
            //requires 1000 ghodium
        },
        getActiveBodyparts: function(type) {
            return getPartCount(type, partArray);
        },
        heal: function(target) {

        },
        move: function(direction) {
            //TOP, TOP_RIGHT, etc.
        },
        moveByPath: function(path) {

        },
        notifyWhenAttacked: function(enabled) {
            //enabled by default
        },
        pickup: function(target) {
            //picking up energy
        },
        rangedAttack: function(target) {

        },
        rangedHeal: function(target) {

        },
        rangedMassAttack: function() {
            //every hostile creep within 3
        },
        repair: function(target) {

        },
        reserveController: function(controller) {
            //1 tick per CLAIM max 5000
        },
        say: function(message, sayPublicly) {},
        signController: function(controller, text) {
            //visible to all players
        },
        suicide: function() {

        },
        transfer: function(target, resourceType, amount) {
            //if amount is left out, then it transfers all
        },
        upgradeController: function(controller) {

        },
        withdraw: function(structure, resourceType, amount) {

        }
    };
    baseCreep = _.merge(baseCreep, memory);
    return baseCreep;
};

function getPartCount(part, partArray) {
    let i=0;
    for (let currentPart in partArray) {
        if (!currentPart || currentPart !== part) {
            continue;
        }
        i++;
    }
    return i;
}