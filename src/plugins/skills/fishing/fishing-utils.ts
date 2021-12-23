import { ICascadeRates, IFish } from './fishing.constants';


export function interpolateNonCascade(level: number, element: IFish, toolUsed: number): ICascadeRates[] {
    const value = Math.floor(element.lowChance * (99 - level) / 98.0) + Math.floor(element.highChance * (level - 1) / 98.0) + 1

    return [{
        id: element.id,
        rate: Math.min(Math.max((value / 256), 0.0), 1.0)
    }]
}

export function interpolate(level: number, lowChance: number, highChance: number) {
    const value = Math.floor(lowChance * (99 - level) / 98.0) + Math.floor(highChance * (level - 1) / 98.0) + 1
    return Math.min(Math.max((value / 256), 0.0), 1.0)
}

export function cascadeInterpolate(elements: IFish[], level: number, toolUsed: number) {
    //sort all elements starting from highest level requirement to lowest; additionally filter out all items that the player
    //cannot obtain yet due to their level
    const items = elements.sort((a, b) => b.levelRequired - a.levelRequired)
    .filter((el) => { 
        return level >= el.levelRequired; 
    })
    .filter((el) => { 
        return el.allowedTools.find(t => t.id === toolUsed); 
    });    

    const rates: ICascadeRates[] = items.map((v) =>{
        return {
            id: v.id,
            rate: interpolate(level, v.lowChance, v.highChance)
        }
    });
    const cascadeRates: ICascadeRates[] = rates.map((v, index) =>{
        let casrate: number;
        if (rates[index-1]) casrate = (1-(rates[index-1].rate)) * (rates[index].rate);
        else casrate = rates[index].rate;
     
        return {
            id: v.id,
            rate: roundToHundredth(casrate)
        }
    });

    return cascadeRates;

}
const roundToHundredth = (value: number) => {
    return Number(value.toFixed(4));
};

export function pickItem(data: ICascadeRates[]): ICascadeRates {
    const roll = Math.random();
    let threshold = 0;
    for (let i = 0; i < data.length; i++) {
        threshold += data[i].rate;
        if (threshold >= roll) {
            return data[i]
        }
    }
}