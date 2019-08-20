"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = __importDefault(require("../component"));
exports.default = component_1.default({
    template: '#player-template',
    data() {
        return {
            tone: `M 0 40 L 470 40.0001 Z`,
            color1: `rgb(0, 0, 0,)`,
            color2: `rgba(0, 0, 0, 0)`,
        };
    },
    computed: {
        artist() {
            return (this.$store.state.track || { artist: '' }).artist;
        },
        title() {
            return (this.$store.state.track || { title: '' }).title;
        },
        duration() {
            return (this.$store.state.track || { duration: 0 }).duration;
        }
    },
    methods: {
        enter() {
            this.$el.classList.add("display-progress");
        },
        out() {
            this.$el.classList.remove("display-progress");
        },
        move(e) {
            this.$el.style.setProperty("--left", `${e.layerX}px`);
            const el = this.$refs.prog;
            const p = (e.layerX / el.clientWidth);
            const t = Math.round(this.$store.state.track.duration * p);
            const hours = Math.floor(t / 3600), t2 = t % 3600;
            const mins = Math.floor(t2 / 60), secs = t2 % 60;
            let width = 12;
            let res = '';
            if (hours > 0)
                res += `${hours}:`;
            res += `${mins}:${secs}`;
            width += res.length * 9.609;
            el.setAttribute('data-text', res);
            el.style.setProperty('--half-width', `${width / 2}px`);
        },
        setTime(e) {
            const el = this.$refs.prog;
            const p = (e.layerX / el.clientWidth);
            this.$store.state.audio.currentTime = this.$store.state.track.duration * p;
            this.$el.style.setProperty('--progress', `${p}`);
        },
    },
    mounted() {
        this.$store.state.audio.addEventListener('timeupdate', () => {
            const p = this.$store.state.audio.currentTime / (this.$store.state.track || { duration: 0 }).duration;
            this.$el.style.setProperty('--progress', `${p}`);
        });
        this.$store.state.audio.addEventListener('ended', () => {
            if (!this.$store.state.audio.loop)
                this.$store.commit('next');
        });
        const ctx = new AudioContext();
        const source = ctx.createMediaElementSource(this.$store.state.audio);
        const analyzer = ctx.createAnalyser();
        source.connect(analyzer);
        analyzer.connect(ctx.destination);
        const width = 470;
        const height = 80;
        const amp = height / 2;
        const frame = () => {
            const data = new Uint8Array(analyzer.frequencyBinCount);
            analyzer.getByteTimeDomainData(data);
            const step = Math.ceil(data.length / 50);
            const volume = 1 / this.$store.state.audio.volume;
            let lastX = 0;
            let lastY = amp;
            let first = true;
            for (let i = 0; i < data.length; i += step) {
                const x = i * (width / data.length);
                let y = data[i] / 128;
                y = ((y - 1) * volume + 1) * (amp / 2) + 20;
                const xc = (lastX + x) / 2;
                const yc = (lastY + y) / 2;
                if (first) {
                    this.tone = `M ${x} ${y} Q ${xc} ${yc} ${width} ${amp}`;
                    first = false;
                }
                else {
                    this.tone = insert(this.tone, lastX, lastY, xc, yc);
                }
                lastX = x;
                lastY = y;
            }
            this.tone = insert(this.tone, lastX, lastY, width, amp);
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
        function insert(text, x1, y1, x2, y2) {
            return text.replace(/(.+?) Q (\d+(?:\.\d+)?) (\d+(?:\.\d+)?) (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)$/, `$1 Q ${x1} ${y1} ${x2} ${y2} Q ${x1} ${y1} $4 $5`);
        }
    }
});
