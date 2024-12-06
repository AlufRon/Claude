// render.js
import {ctx, project, TABLE_LENGTH, TABLE_WIDTH, TABLE_HEIGHT} from './utils.js';

export function renderScene(state) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    drawTable();
    drawNet();
    drawPaddles(state.paddleA, state.paddleB);
    drawBall(state.ball);
}

function drawTable() {
    // Table surface
    const fl = project(0, 0);
    const fr = project(0, TABLE_WIDTH);
    const bl = project(TABLE_LENGTH, 0);
    const br = project(TABLE_LENGTH, TABLE_WIDTH);
    
    ctx.fillStyle = '#2f8f2f';
    ctx.beginPath();
    ctx.moveTo(fl.px, fl.py);
    ctx.lineTo(fr.px, fr.py);
    ctx.lineTo(br.px, br.py);
    ctx.lineTo(bl.px, bl.py);
    ctx.closePath();
    ctx.fill();
    
    drawLegs();
}

function drawLegs() {
    const legInset = 0.2;
    const legThickness = 0.05;
    
    drawLeg(legInset, legInset);
    drawLeg(legInset, TABLE_WIDTH - legInset - legThickness);
    drawLeg(TABLE_LENGTH - legInset - legThickness, legInset);
    drawLeg(TABLE_LENGTH - legInset - legThickness, TABLE_WIDTH - legInset - legThickness);
}

function drawLeg(x, y) {
    const h = TABLE_HEIGHT;
    const w = 0.05;
    const topFront = project(x, y);
    const topBack = project(x + w, y);
    const bottomFront = project(x, y + h);
    const bottomBack = project(x + w, y + h);
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(topFront.px, topFront.py);
    ctx.lineTo(topBack.px, topBack.py);
    ctx.lineTo(bottomBack.px, bottomBack.py);
    ctx.lineTo(bottomFront.px, bottomFront.py);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    const cl = project(TABLE_LENGTH/2, 0);
    const cr = project(TABLE_LENGTH/2, TABLE_WIDTH);
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cl.px, cl.py);
    ctx.lineTo(cr.px, cr.py);
    ctx.stroke();
}

function drawPaddles(paddleA, paddleB) {
    const headDiameter = 0.15;
    const handleLength = 0.1;
    const handleWidth = 0.03;
    
    drawPaddle(paddleA.x, paddleA.y, headDiameter, handleLength, handleWidth, 'red');
    drawPaddle(paddleB.x, paddleB.y, headDiameter, handleLength, handleWidth, 'blue');
}

function drawPaddle(px, py, d, hl, hw, color) {
    // Paddle head
    const centerX = px;
    const centerY = py + d/2;
    const centerProj = project(centerX, centerY);
    const radius = (d/2) * 120;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerProj.px, centerProj.py, radius, 0, 2*Math.PI);
    ctx.fill();
    
    // Handle
    const handleTopLeft = project(px, py + d);
    const handleTopRight = project(px + hw, py + d);
    const handleBottomLeft = project(px, py + d + hl);
    const handleBottomRight = project(px + hw, py + d + hl);
    
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(handleTopLeft.px, handleTopLeft.py);
    ctx.lineTo(handleTopRight.px, handleTopRight.py);
    ctx.lineTo(handleBottomRight.px, handleBottomRight.py);
    ctx.lineTo(handleBottomLeft.px, handleBottomLeft.py);
    ctx.closePath();
    ctx.fill();
}

function drawBall(ball) {
    const p = project(ball.x, ball.y);
    
    // Ball
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(p.px, p.py, 5, 0, 2*Math.PI);
    ctx.fill();
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(p.px, p.py + 8, 8, 3, 0, 0, 2*Math.PI);
    ctx.fill();
}