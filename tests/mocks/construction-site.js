module.exports = function(id, x, y, room, type) {
    return {
        pos: {
            x: x,
            y: y,
        },
        room: room,
        id: id,
        my: true,
        owner: 'Multitallented',
        progress: 0,
        progressTotal: 2000,
        structureType: type,
        remove: function() {
            let siteArray = this.room.entities.FIND_CONSTRUCTION_SITES;
            let index = siteArray.indexOf(this);
            if (index > -1)
                siteArray.splice(index, 1);
        }
    };
};