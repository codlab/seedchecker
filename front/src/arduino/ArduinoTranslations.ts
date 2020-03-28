const _map: Map<string, string> = new Map();
const set = (key: string, value: string) => _map.set(key, value);

set("at90usb1286", "Teensy 2.0++");
set("atmega16u2", "Arduino UNO R3");
set("atmega32u4", "Arduino Micro/Teensy 2.0");

set("all","MultiBot");
set("auto_3day_skipper","3 Days Skipper");
set("auto_fossil","Fossils");
set("auto_host", "Host");
set("auto_loto", "Loto");
set("berry_farmer", "Berries");
set("box_release", "Box Release");
set("day_skipper_eu", "Day Skipper (EU)");
set("day_skipper_eu_nolimit", "DaySkipper_EU_NoLimit");
set("day_skipper_jp", "Day Skipper (JP)");
set("day_skipper_jp_nolimit", "DaySkipper_JP_NoLimit");
set("day_skipper_us", "Day Skipper (US)");
set("day_skipper_us_nolimit", "DaySkipper_US_NoLimit");
set("day_skippers", "Day Skippers");
set("turbo_a", "Turbo A");
set("watt_farmer", "Watt Farmer");

set("use_link_code", "Use code");
set("use_random_code", "Random");
set("initial_rand_seed", "Initial seed");
set("link_code", "Link Code");

set("day", "Day");
set("month", "month");
set("year", "year");

set("first_fossil_top_slot", "FIRST_FOSSIL_TOP_SLOT");
set("second_fossil_top_slot", "SECOND_FOSSIL_TOP_SLOT");
set("time_before_sr", "TIME_BEFORE_SR");
set("auto_soft_reset", "AUTO_SOFT_RESET");
set("day_to_skip", "Day to skip");
set("box_count", "Box count");

export const t = (key: string): string => {
    return _map.get(key) || "";
}