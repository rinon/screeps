import * as _ from "lodash";

export class LinkController {
    static run(room: Room) {
        let closestLink = null;
        let closestLinkRange = 99;
        const myLinks = room.find(FIND_MY_STRUCTURES, {filter: (s:Structure) => { return s.structureType == STRUCTURE_LINK}});
        _.forEach(myLinks, (link: StructureLink) => {
            const range = link.pos.getRangeTo(link.room.controller.pos);
            if (closestLink == null || closestLinkRange > range) {
                closestLink = link;
                closestLinkRange = range;
            }});
        _.forEach(myLinks, (link: StructureLink) => {
            if (closestLink.id != link.id && link.cooldown < 1 && link.store.energy > 0) {
                link.transferEnergy(closestLink, Math.min(link.store.energy, closestLink.store.getFreeCapacity(RESOURCE_ENERGY)))
            }});
    }
}