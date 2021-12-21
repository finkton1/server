import { itemIds } from '@engine/world/config/item-ids';
import { animationIds } from '@engine/world/config/animation-ids';

export const findEquipment = (equipmentId: number): IFishingEquipment | null => {
    return equipment.find(eq => eq.id === equipmentId);
};

export const findEquipmentAllowedAtSpot = (allowedTool: number[]): IFishingEquipment[] => {
    let eq: IFishingEquipment[] = [];
    for (let tool of allowedTool) {
        eq.push(equipment.find(eq => eq.id === tool));
    }
    return eq;
};

export const findSpot = (spotId: number): IFishingSpots | null => {
    return spots.find(s => s.spotId === spotId);
};

export interface IFishingEquipment {
    id: number;
    style: string;
    levelRequired: number;
    animationId: number;
}

export interface IFishingSpots {
    spotId: number;
    allowedTools: IFishingEquipment[];
    baseChance: number;
}

export interface IFish {
    id: number;
    allowedTools: IFishingEquipment[];
    baseChance: number;
}

export const equipment: IFishingEquipment[] = [
    {
        id: itemIds.fishing.small_fishing_net,
        style: 'net',
        levelRequired: 1,
        animationId: animationIds.fishing.smallFishingNet
    },
    {
        id: itemIds.fishing.fishing_rod,
        style: 'bait',
        levelRequired: 5,
        animationId: animationIds.fishing.fishingRod
    },
    {
        id: itemIds.fishing.big_fishing_net,
        style: 'net',
        levelRequired: 16,
        animationId: animationIds.fishing.bigFishingNet
    }
]

export const spots: IFishingSpots[] = [
    {
        spotId: 316,
        allowedTools: findEquipmentAllowedAtSpot([itemIds.fishing.small_fishing_net, itemIds.fishing.fishing_rod]),
        baseChance: 100
    }
]





