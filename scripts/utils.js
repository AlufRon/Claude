// utils.js
export const TABLE_LENGTH = 2.74;    // meters
export const TABLE_WIDTH = 1.525;    // meters
export const TABLE_HEIGHT = 0.76;    // meters
export const SCALE = 150;  // pixels per meter

export let canvas = null;
export let ctx = null;

export function setupCanvas() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = 800;
    canvas.height = 400;
    ctx = canvas.getContext('2d');
}

export function project(x, y) {
    const baseX = x * SCALE;
    const baseY = y * SCALE;
    
    const distanceFactor = 5;
    const factor = 1 / (1 + x/distanceFactor);
    
    const px = 100 + (baseX * factor);
    const py = (canvas.height - 50) - (baseY * factor);
    
    return {px, py};
}