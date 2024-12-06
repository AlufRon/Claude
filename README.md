# Ping Pong Animation

A realistic ping pong animation featuring a 3D perspective view with table legs, paddles, and ball physics.

## Features

- 3D perspective rendering
- Realistic table with legs
- Animated paddles and ball
- Ball physics with paddle collisions
- AI-controlled paddles
- Score overlay

## Setup

1. Clone the repository:
```bash
git clone https://github.com/AlufRon/Claude.git
```

2. Serve the files using any static file server. For example with Python:
```bash
# Python 3
python -m http.server
```

3. Open in browser:
```
http://localhost:8000
```

## Technical Details

- Pure JavaScript with ES6 modules
- Canvas-based rendering
- Perspective projection for 3D effect
- Modular code structure:
  - `utils.js`: Canvas setup and projection functions
  - `render.js`: Scene drawing functions
  - `game.js`: Game state and physics
  - `main.js`: Animation loop

## License

MIT