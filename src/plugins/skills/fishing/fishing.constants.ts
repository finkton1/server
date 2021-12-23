import { itemIds } from '@engine/world/config/item-ids';
import { animationIds } from '@engine/world/config/animation-ids';

export const findEquipment = (equipmentId: number): IFishingEquipment | null => {
    return equipment.find(eq => eq.id === equipmentId);
};

const findEquipmentAllowed = (allowedTool: number[]): IFishingEquipment[] => {
    const eq: IFishingEquipment[] = [];
    for (const tool of allowedTool) {
        eq.push(equipment.find(eq => eq.id === tool));
    }
    return eq;
};

const findPossibleFish = (pfish: number[]): IFish[] => {
    const eq: IFish[] = [];
    for (const _fish of pfish) {
        eq.push(fish.find(eq => eq.id === _fish));
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
    possibleFish: IFish[];
    isCascade: boolean;
}

export interface IFish {
    id: number;
    allowedTools: IFishingEquipment[];
    levelRequired: number;
    lowChance: number;
    highChance: number;
}

export interface ICascadeRates {
    id: number;
    rate: number;
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

export const fish: IFish[] = [

    //Raw Shrimps
    {
        id: 317,
        allowedTools: findEquipmentAllowed([itemIds.fishing.small_fishing_net]),
        levelRequired: 1,
        lowChance: 48,
        highChance: 256
    },
    //Raw Anchovies
    {
        id: 321,
        allowedTools: findEquipmentAllowed([itemIds.fishing.small_fishing_net]),
        levelRequired: 15,
        lowChance: 24,
        highChance: 128
    },
    //Raw Sardines
    {
        id: 327,
        allowedTools: findEquipmentAllowed([itemIds.fishing.fishing_rod]),
        levelRequired: 5,
        lowChance: 32,
        highChance: 192
    },
    //Raw Herring
    {
        id: 345,
        allowedTools: findEquipmentAllowed([itemIds.fishing.fishing_rod]),
        levelRequired: 10,
        lowChance: 24,
        highChance: 128
    }
]

export const spots: IFishingSpots[] = [
    {
        spotId: 316,
        allowedTools: findEquipmentAllowed([itemIds.fishing.small_fishing_net, itemIds.fishing.fishing_rod]),
        possibleFish: findPossibleFish([317, 321, 327, 345]),
        isCascade: true
    }
]





