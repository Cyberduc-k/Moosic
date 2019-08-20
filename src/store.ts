import Vuex from "vuex";
import load from "./loader";

type Track = { title: string, artist: string, duration: number, album: string, url: string } | null

export default new Vuex.Store({
    state: {
        audio: new Audio(),
        playing: false,
        queue: <string[]>JSON.parse(localStorage.getItem('queue') || '[]'),
        current: parseInt(localStorage.getItem('current') || '-1'),
        shuffle: localStorage.getItem('shuffle') == 'true',
        track: <Track>null,
        prev_queue: <number[]>[],
    },
    mutations: {
        next(state)
        {
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
            load(state.queue[state.current]).then(track => state.track = track);
        },
        prev(state)
        {
            const popped = state.prev_queue.pop();
            
            if (popped !== undefined && popped !== null) {
                state.current = popped;
            } else {
                if (state.current > 0)
                    state.current--;
                else
                    state.current = state.queue.length - 1;
            }
            
            state.audio.src = state.queue[state.current];
            state.audio.play();
            load(state.queue[state.current]).then(track => state.track = track);
        }
    },
});