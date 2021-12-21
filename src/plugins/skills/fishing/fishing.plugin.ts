import { ItemOnNpcAction, itemOnNpcActionHandler, ItemOnNpcActionHook, NpcInteractionAction, NpcInteractionActionHook, ObjectInteractionAction, TaskExecutor } from "@engine/action";
import { logger } from "@runejs/core";
import { itemIds } from '@engine/world/config/item-ids';
import { canInitiateHarvest } from "@engine/world/skill-util/harvest-skill";
import { Skill } from "@engine/world/actor/skills";
import { findItem } from "@engine/config";
import { equipment, findEquipment, findSpot, IFishingSpots, IFishingEquipment } from "./fishing.constants";
import { randomBetween } from "@engine/util";
import { activeWorld, World } from "@engine/world";
import { soundIds } from "@engine/world/config/sound-ids";



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

    task.session.tool = toolToUse;
    task.session.spot = spot;

    if(taskIteration === 0) {
        // First run
        player.sendMessage(`You cast out your ${findItem(toolToUse.id).name}.`);
        player.playSound(soundIds.fishing.fishing, 7, 0);
        player.playAnimation(toolToUse.animationId);
    }

    return true;
    

};

const activate = (task: TaskExecutor<ItemOnNpcAction>, taskIteration: number): boolean => {
    const { session } = task.getDetails();
    const { item, player, npc } = task.actionData;

    const spot: IFishingSpots = session.spot;
    const tool: IFishingEquipment = session.tool;
     // Cancel if the actor no longer has their tool or level requirements.
     if(!tool || !spot) {
        return false;
    }
    // Make sure the fishing spot exists
    const targetedSpot = activeWorld.findNearbyNpcsById(player.position, npc.id, 1);

    if(!targetedSpot) {
        // Fishing spot went away cancel this action.
        return false;
    }

    if(taskIteration % 4 === 0 && taskIteration != 0) {
        const successChance = randomBetween(0, 255);
        const percentNeeded = spot.baseChance + player.skills.fishing.level;
    
        if(successChance <= percentNeeded) {

            if (player.inventory.hasSpace()) {
                player.inventory.add(317);
                player.sendMessage(`You catch some shrimps.`);
            } else {
                player.sendMessage(
                    `Your inventory is too full to hold any more shrimps.`, true);
                player.playSound(soundIds.inventoryFull);
                return false;
            }
      
   
        } else {

        }
    
    }

    if(taskIteration % 4 === 0 && taskIteration !== 0) {
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