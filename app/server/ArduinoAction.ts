import Arduino from "./arduino";

export interface ArduinoParamQuery {
    name: string,
    make_param: string
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
    folder: string,
    name: string,
    params?: ArduinoParam[]
}


export const ArduinoActions: ArduinoAction[] = [
    {folder: "all", name: "MultiBot"},
    {folder: "auto_3day_skipper", name: "Auto3DaySkipper"},
    {folder: "auto_fossil", name: "AutoFossil"},
    {folder: "auto_host", name: "AutoHost"},
    {folder: "auto_loto", name: "AutoLoto"},
    {folder: "berry_farmer", name: "BerryFarmer"},
    {folder: "box_release", name: "BoxRelease"},
    {folder: "day_skipper_eu", name: "DaySkipper_EU"},
    {folder: "day_skipper_eu_nolimit", name: "DaySkipper_EU_NoLimit"},
    {folder: "day_skipper_jp", name: "DaySkipper_JP"},
    {folder: "day_skipper_jp_nolimit", name: "DaySkipper_JP_NoLimit"},
    {folder: "day_skipper_us", name: "DaySkipper_US"},
    {folder: "day_skipper_us_nolimit", name: "DaySkipper_US_NoLimit"},
    {folder: "day_skippers", name: "DaySkippers"},
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

export const actionFrom = (req: any): ArduinoActionMake|null => {
    const body = req.body || {};
    const query = req.query || {};
    var folder: string|null = null;
    var holder = {};
    if(body && body.action) {
        folder = body.action;
        holder = body;
    } else if(query && query.action) {
        folder = query.action;
        holder = query;
    } else {
        return null;
    }

    const action = ArduinoActions.find(item => item.folder === folder);
    if(!action) return null;

    const result: ArduinoActionMake = {folder: action.folder, name: action.name};
    result.params = (action.params || []).map(p => ({ name: p.make_param, value: toNumber(holder[p.name]) }));

    console.log("Will execute for following", {result});
    return result;
}