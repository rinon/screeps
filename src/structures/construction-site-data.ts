
export class ConstructionSiteData {
    public pos: RoomPosition;
    public structureType: StructureConstant;

    constructor(pos:RoomPosition, structureType: StructureConstant) {
        this.pos = pos;
        this.structureType = structureType;
    }
}