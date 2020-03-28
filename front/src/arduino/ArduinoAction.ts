import { Architectures } from "./Architectures";

export interface ArduinoParamQuery {
    name: string,
    make_param: string,
    type?: "boolean",
    min?: number,
    max?: number
}

export interface ArduinoParam {
    name: string,
    value: number
}

export interface ArduinoAction {
    folder: string,
    name: string,
    params?: ArduinoParamQuery[]
}

export interface ArduinoActionMake {
    architecture: string,
    folder: string,
    name: string,
    params: ArduinoParam[]
}


export const ArduinoActions: ArduinoAction[] = [
    {folder: "all", name: "MultiBot"},
    {folder: "auto_3day_skipper", name: "Auto3DaySkipper"},
    {folder: "auto_fossil", name: "AutoFossil", params: [
        { name: "first_fossil_top_slot", make_param: "FIRST_FOSSIL_TOP_SLOT", type: "boolean", min: 0, max: 1},
        { name: "second_fossil_top_slot", make_param: "SECOND_FOSSIL_TOP_SLOT", type: "boolean", min: 0, max: 1},
        { name: "time_before_sr", make_param: "TIME_BEFORE_SR", min: 1},
        { name: "auto_soft_reset", make_param: "AUTO_SOFT_RESET", type: "boolean", min: 0, max: 1}
    ]},
    {folder: "auto_host", name: "AutoHost", params: [
        { name: "use_link_code", make_param: "USE_LINK_CODE", type: "boolean", min: 0, max: 1},
        { name: "use_random_code", make_param: "USE_RANDOM_CODE", type: "boolean", min: 0, max: 1},
        { name: "initial_rand_seed", make_param: "INITIAL_RAND_SEED", min: 1},
        { name: "link_code", make_param: "LINK_CODE", min: 0, max: 9999}
    ]},
    {folder: "auto_loto", name: "AutoLoto", params: [
        { name: "day_to_skip", make_param: "DAY_TO_SKIP"}
    ]},
    {folder: "berry_farmer", name: "BerryFarmer"},
    {folder: "box_release", name: "BoxRelease", params: [
        { name: "box_count", make_param: "BOX_COUNT", min: 1}
    ]},
    {folder: "day_skipper_eu", name: "DaySkipper_EU", params: [
        { name: "day", make_param: "DAY", min: 1, max: 31},
        { name: "month", make_param: "MONTH", min: 1, max: 12},
        { name: "year", make_param: "YEAR", min: 2000, max: 2066},
        { name: "day_to_skip", make_param: "DAY_TO_SKIP", min: 1}
    ]},
    {folder: "day_skipper_eu_nolimit", name: "DaySkipper_EU_NoLimit", params: [
        { name: "day_to_skip", make_param: "DAY_TO_SKIP", min: 1}
    ]},
    {folder: "day_skipper_jp", name: "DaySkipper_JP", params: [
        { name: "day", make_param: "DAY", min: 1, max: 31},
        { name: "month", make_param: "MONTH", min: 1, max: 12},
        { name: "year", make_param: "YEAR", min: 2000, max: 2066},
        { name: "day_to_skip", make_param: "DAY_TO_SKIP", min: 1}
    ]},
    {folder: "day_skipper_jp_nolimit", name: "DaySkipper_JP_NoLimit", params: [
        { name: "day_to_skip", make_param: "DAY_TO_SKIP", min: 1}
    ]},
    {folder: "day_skipper_us", name: "DaySkipper_US", params: [
        { name: "day", make_param: "DAY", min: 1, max: 31},
        { name: "month", make_param: "MONTH", min: 1, max: 12},
        { name: "year", make_param: "YEAR", min: 2000, max: 2066},
        { name: "day_to_skip", make_param: "DAY_TO_SKIP", min: 1}
    ]},
    {folder: "day_skipper_us_nolimit", name: "DaySkipper_US_NoLimit", params: [
        { name: "day_to_skip", make_param: "DAY_TO_SKIP", min: 1}
    ]},
    {folder: "day_skippers", name: "DaySkippers"}, //TODO
    {folder: "turbo_a", name: "TurboA"},
    {folder: "watt_farmer", name: "WattFarmer"}
];

function toNumber(value: any) {
    if(!value) return 0;
    try {
        const result = parseInt(value, 10);
        if(isNaN(result)) return 0;
        if(result < 0) return 0;
        return result;
    } catch(e) {
        return 0;
    }
}

export const actionFromHolder = (holder: any): ArduinoActionMake|null => {
    const folder = holder.action;
    const architecture = holder.architecture;

    if(!architecture || !Architectures.find(a => a === architecture)) {
        return null;
    }

    const action = ArduinoActions.find(item => item.folder === folder);
    if(!action) return null;

    const result: ArduinoActionMake = {architecture, folder: action.folder, name: action.name, params: []};
    const params = (action.params || []);
    const keys = Object.keys(holder).filter(k => params.find(p => p.name == k));
    if(keys.length !== params.length) {
        console.log("the keys do not match", {params, keys});
        return null;
    }

    result.params = params.map(p => ({ name: p.make_param, value: toNumber(holder[p.name]) }));

    console.log("Will execute for following", {result});
    return result;
}