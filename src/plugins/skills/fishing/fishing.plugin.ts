import { ItemOnNpcAction, itemOnNpcActionHandler, ItemOnNpcActionHook, NpcInteractionAction, NpcInteractionActionHook, ObjectInteractionAction, TaskExecutor } from '@engine/action';
import { logger } from '@runejs/core';
import { itemIds } from '@engine/world/config/item-ids';
import { canInitiateHarvest } from '@engine/world/skill-util/harvest-skill';
import { Skill } from '@engine/world/actor/skills';
import { findItem } from '@engine/config';
import { equipment, findEquipment, findSpot, IFishingSpots, IFishingEquipment, ICascadeRates } from './fishing.constants';
import { randomBetween } from '@engine/util';
import { activeWorld, World } from '@engine/world';
import { soundIds } from '@engine/world/config/sound-ids';
import { playerWalkTo } from '@engine/plugins';
import { cascadeInterpolate, interpolate, interpolateNonCascade, pickItem } from './fishing-utils';



const startFishingByItem = (task: TaskExecutor<ItemOnNpcAction>, taskIteration: number): boolean => {
    const { item, player, npc } = task.actionData;

    player.face(npc.position);

    const spot = findSpot(npc.id);
    const toolToUse = spot.allowedTools.find(t => t.id === item.itemId);

    if (!spot) {
        return;
    }

    if (!toolToUse) {
        player.sendMessage(`You cannot use this fishing tool here.`);
        return false;
    }

    if (!player.hasItemInInventory(item.itemId)) {
        player.sendMessage(`You do not have a ${ findItem(toolToUse.id).name } to fish with.`);
        return false;
    }

    const level = player.skills.get(Skill.FISHING).level;
    if (level < toolToUse.levelRequired) {
        player.sendMessage(`You need a fishing level of ${toolToUse.levelRequired} to use a ${ findItem(toolToUse.id).name } at this spot.`, true);
        return;
    }

    task.session.tool = toolToUse;
    task.session.spot = spot;

    if(taskIteration === 0) {
        // First run
        player.sendMessage(`Attempting to catch a fish...`);
        player.playAnimation(toolToUse.animationId);
    }

    return true;

};

const startFishingByInteraction = (task: TaskExecutor<NpcInteractionAction>, taskIteration: number): boolean => {
    const { player, npc, option } = task.actionData;

    player.face(npc.position);

    const spot = findSpot(npc.id);
    const toolToUse = spot.allowedTools.find(t => t.style === option);

    if (!spot) {
        return;
    }

    if (!toolToUse) {
        player.sendMessage(`You cannot use this fishing tool here.`);
        return false;
    }

    if (!player.hasItemInInventory(toolToUse.id)) {
        player.sendMessage(`You do not have a ${ findItem(toolToUse.id).name } to fish with.`);
        return false;
    }

    const level = player.skills.get(Skill.FISHING).level;
    if (level < toolToUse.levelRequired) {
        player.sendMessage(`You need a fishing level of ${toolToUse.levelRequired} to use a ${ findItem(toolToUse.id).name } at this spot.`, true);
        return;
    }

    if(taskIteration === 0) {
        // First run
        player.sendMessage(`You cast out your ${findItem(toolToUse.id).name}.`);
        player.playSound(soundIds.fishing.fishing, 7, 0);
        player.playAnimation(toolToUse.animationId);
      
        if (spot.isCascade) {
            task.session.spotSuccessChances = cascadeInterpolate(spot.possibleFish, player.skills.fishing.level, toolToUse.id);
        } else {
            task.session.spotSuccessChances = interpolateNonCascade(player.skills.fishing.level, spot.possibleFish[0], toolToUse.id);
        }
         
        task.session.tool = toolToUse;
        task.session.spot = spot;
        logger.info('Spot success chances: ' + JSON.stringify(task.session.spotSuccessChances));
    }

    return true;
    

};

const activate = (task: TaskExecutor<ItemOnNpcAction>, taskIteration: number): boolean => {
    const { session } = task.getDetails();
    const { item, player, npc } = task.actionData;

    const spot: IFishingSpots = session.spot;
    const tool: IFishingEquipment = session.tool;
    const successChances: ICascadeRates[] = session.spotSuccessChances;

    // Cancel if the actor no longer has their tool or level requirements.
    if(!tool || !spot) {
        return false;
    }
    // Make sure the fishing spot exists
    const targetedSpot = activeWorld.findNearbyNpcsById(player.position, npc.id, 1);
    // logger.info('the spot: ' + JSON.stringify(spot));
    if(!targetedSpot) {
        // Fishing spot went away cancel this action.
        return false;
    }

    if(taskIteration % 5 === 0 && taskIteration != 0) {

        const itemRoll = pickItem(successChances);

        if (!itemRoll) {
            logger.info('This roll failed, lets try next roll...');
            return;
        }

        if (itemRoll) {
            logger.info(`we should recieve a ${findItem(itemRoll.id).name}`)
            if (player.inventory.hasSpace()) {
                player.inventory.add(itemRoll.id);
                player.sendMessage(`You catch some ${findItem(itemRoll.id).name}.`);
            } else {
                player.sendMessage(`Your inventory is too full to hold any more ${findItem(itemRoll.id).name}.`, true);
                player.playSound(soundIds.inventoryFull);
                return false;
            }
        }
    
    }

    if(taskIteration % 3 === 0 && taskIteration !== 0) {
        player.playAnimation(tool.animationId);
    }

    return true;
};

const onComplete = (task: TaskExecutor<ObjectInteractionAction>): void => {
    const { player } = task.actionData;
    player.stopAnimation();
};






export default {
    pluginId: 'rs:fishing_skill',
    hooks: [
        {
            type: 'item_on_npc',
            npcs: 'rs:fishing_spot_draynor',
            itemIds: equipment.map(id => (id.id)),
            walkTo: false,
            task: {
                canActivate: startFishingByItem,
                activate,
                onComplete,
                interval: 1
            }
        } as ItemOnNpcActionHook,
        {
            type: 'npc_interaction',
            npcs: 'rs:fishing_spot_draynor',
            options: ['net', 'bait'],
            itemIds: equipment.map(id => (id.id)),
            walkTo: false,
            task: {
                canActivate: startFishingByInteraction,
                activate,
                onComplete,
                interval: 1
            }
        } as NpcInteractionActionHook
    ]
};