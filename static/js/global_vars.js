let canvas = document.querySelector('#canvas')
let c = canvas.getContext('2d');

let lm_canvas = document.querySelector('#light_map_canvas')
let lm = lm_canvas.getContext('2d');

let sfx_canvas = document.querySelector('#sfx_canvas')
let sfx = sfx_canvas.getContext('2d');

//Canvas settings
c.textBaseline = 'top'; 
c.imageSmoothingEnabled = true;

//Options
let draw_hit_boxes = false;
let draw_side_cols = false;

//Physics vars
let g = {x: 0 , y: 0.25}

//Game State
let paused = false;
let debug_mode = false;

//Types
const NONE = 'none'
const RIGHT = 'right'
const LEFT = 'left'
const TOP = 'top'
const BOTTOM = 'bottom'
const CENTER = 'center'
const CIRCLE = 'circle'
const INTERACT_KEY = 'E'
const DEATH_MESSAGE =  'Sucks to suck, you died! Better luck next time!'

// - Alignments
const GOOD = 'good';
const NEUTRAL = 'neutral'
const EVIL = 'evil';

// - Draw Modes
const S_OVER = 'source-over'
const S_IN = 'source-in'
const S_ATOP = 'source-atop'

let light_map_pos;
let holo_key;

//Ids
let level_id, body_id, gui_id

let debug1 = 0
let debug2 = false;

let missing_img = new Image()
missing_img.src = 'assets/missing.png'

let plr;

let inv_layer, skills_layer;

let args, shield_args, sprite_args;
let contents = []
let GUIs = []
let lights = []

let title_scrn, lvl1, lvl2;
let current_lvl, current_cam;

let interact_key_down = false;

//Slots
let primary_weapon_slot, secondary_weapon_slot;
let consumable_slot_1, consumable_slot_2, consumable_slot_3, consumable_slot_4;
let shield_slot;

//Drawing
let hurt_opacity_mx = 0.5
let hurt_color;

const HP_SHOW_TIME = 500
const HP_FADE_TIME = 200
let hp_show_tmr = -HP_FADE_TIME;
let hide_hp = true;

const LEFT_IMG = '_left'
const RIGHT_IMG = '_right'