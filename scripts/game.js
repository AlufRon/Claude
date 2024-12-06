// game.js
import {TABLE_LENGTH, TABLE_WIDTH} from './utils.js';

export let state = {
    paddleA: {x: 0.5, y: TABLE_WIDTH/2 - 0.075},
    paddleB: {x: TABLE_LENGTH - 0.65, y: TABLE_WIDTH/2 - 0.075},
    ball: {x: TABLE_LENGTH/2, y: TABLE_WIDTH/2, vx: 0.01, vy: 0.005}
};

export function updateState(delta) {
    // Move ball
    state.ball.x += state.ball.vx * delta;
    state.ball.y += state.ball.vy * delta;

    // Bounce off table edges
    if (state.ball.y < 0 || state.ball.y > TABLE_WIDTH) {
        state.ball.vy = -state.ball.vy;
        // Add slight randomness to prevent repetitive patterns
        state.ball.vy *= 0.95 + Math.random() * 0.1;
    }

    // Paddle collision detection
    const paddleAHit = (state.ball.x < (state.paddleA.x + 0.15)) && 
                      (state.ball.x > state.paddleA.x) &&
                      (state.ball.y > state.paddleA.y) && 
                      (state.ball.y < state.paddleA.y + 0.15);

    const paddleBHit = (state.ball.x > state.paddleB.x) && 
                      (state.ball.x < (state.paddleB.x + 0.15)) &&
                      (state.ball.y > state.paddleB.y) && 
                      (state.ball.y < state.paddleB.y + 0.15);

    // Handle paddle hits
    if (paddleAHit) {
        state.ball.vx = Math.abs(state.ball.vx);
        // Add spin effect
        state.ball.vy += (Math.random() - 0.5) * 0.01;
    }

    if (paddleBHit) {
        state.ball.vx = -Math.abs(state.ball.vx);
        state.ball.vy += (Math.random() - 0.5) * 0.01;
    }

    // Reset ball if it goes past paddles
    if (state.ball.x < 0 || state.ball.x > TABLE_LENGTH) {
        state.ball.x = TABLE_LENGTH/2;
        state.ball.y = TABLE_WIDTH/2;
        state.ball.vx = 0.01 * (Math.random() > 0.5 ? 1 : -1);
        state.ball.vy = 0.005 * (Math.random() > 0.5 ? 1 : -1);
    }

    // Simple AI for paddles
    movePaddles(delta);
}

function movePaddles(delta) {
    // Paddle A follows ball with slight delay
    const targetYA = state.ball.y - 0.075;
    state.paddleA.y += (targetYA - state.paddleA.y) * 0.1;

    // Paddle B follows ball with slight delay
    const targetYB = state.ball.y - 0.075;
    state.paddleB.y += (targetYB - state.paddleB.y) * 0.1;

    // Keep paddles within table bounds
    state.paddleA.y = Math.max(0, Math.min(TABLE_WIDTH - 0.15, state.paddleA.y));
    state.paddleB.y = Math.max(0, Math.min(TABLE_WIDTH - 0.15, state.paddleB.y));
}