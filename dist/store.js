"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vuex_1 = __importDefault(require("vuex"));
const loader_1 = __importDefault(require("./loader"));
exports.default = new vuex_1.default.Store({
    state: {
        audio: new Audio(),
        playing: false,
        queue: JSON.parse(localStorage.getItem('queue') || '[]'),
        current: parseInt(localStorage.getItem('current') || '-1'),
        shuffle: localStorage.getItem('shuffle') == 'true',
        track: null,
        prev_queue: [],
    },
    mutations: {
        next(state) {
            state.prev_queue.push(state.current);
            if (state.current < state.queue.length - 1)
                state.current++;
            else
                state.current = 0;
            if (state.shuffle) {
                state.current = Math.round(Math.random() * (state.queue.length - 1));
            }
            state.audio.src = state.queue[state.current];
            state.audio.play();
            loader_1.default(state.queue[state.current]).then(track => state.track = track);
        },
        prev(state) {
            const popped = state.prev_queue.pop();
            if (popped !== undefined && popped !== null) {
                state.current = popped;
            }
            else {
                if (state.current > 0)
                    state.current--;
                else
                    state.current = state.queue.length - 1;
            }
            state.audio.src = state.queue[state.current];
            state.audio.play();
            loader_1.default(state.queue[state.current]).then(track => state.track = track);
        }
    },
});
