// main.js
import {setupCanvas} from './utils.js';
import {updateState, state} from './game.js';
import {renderScene} from './render.js';

// Initialize canvas
setupCanvas();

let lastTime = performance.now();
let running = true;

function gameLoop(currentTime) {
    if (!running) return;

    const delta = (currentTime - lastTime) * 0.1;
    lastTime = currentTime;

    updateState(delta);
    renderScene(state);

    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

// Optional: pause game when tab is inactive
document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) {
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
});