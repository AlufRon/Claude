const TABLE = {
    LENGTH: 2.74,
    WIDTH: 1.525,
    HEIGHT: 0.76,
    TOP_THICKNESS: 0.03,
    BORDER_WIDTH: 0.02,
};

const PADDLE = {
    HEAD_DIAMETER: 0.15,
    HANDLE_LENGTH: 0.10,
    HANDLE_WIDTH: 0.03,
};

const BALL = {
    DIAMETER: 0.04,
    INITIAL_SPEED: 5,
};

const CAMERA = {
    POSITION: { x: 1.37, y: 0.76, z: 1.0 },
    TILT: 5 * Math.PI / 180,
    FOV: 60 * Math.PI / 180,
};

const COLORS = {
    TABLE_GREEN: '#1B5E20',
    TABLE_BORDER: '#FFFFFF',
    PADDLE_RED: '#D32F2F',
    PADDLE_BLACK: '#212121',
    PADDLE_HANDLE: '#8D6E63',
};