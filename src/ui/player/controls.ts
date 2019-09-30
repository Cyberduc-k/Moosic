import Component from "../component";
import { loadImage } from "../../loader";
import { ipcRenderer } from "electron";
import Color from "color";

export default Component({
    template: '#controls-template',
    // @ts-ignore
    asyncComputed: {
        image: <any>{
            get(): Promise<string>
            {
                return new Promise(resolve =>
                {
                    if (this.$store.state.current !== -1)
                    {
                        const filename = this.$store.state.queue[this.$store.state.current];

                        loadImage(filename).then(data =>
                        {
                            if (data[0] !== undefined && data[1] !== undefined)
                            {
                                const str = `data:${data[0]};base64,${data[1]}`;

                                resizedataURL(str, data[0], 200, 200)
                                    .then(([uri, rgb]) =>
                                    {
                                        document.body.style.setProperty('--color-r', `${rgb.r}`);
                                        document.body.style.setProperty('--color-g', `${rgb.g}`);
                                        document.body.style.setProperty('--color-b', `${rgb.b}`);

                                        resolve(uri);
                                    })
                                    .catch(() => {
                                        document.body.style.setProperty('--color-r', `127`);
                                        document.body.style.setProperty('--color-g', `127`);
                                        document.body.style.setProperty('--color-b', `127`);
                                        
                                        resolve('');
                                    });
                            }
                            else {
                                document.body.style.setProperty('--color-r', `127`);
                                document.body.style.setProperty('--color-g', `127`);
                                document.body.style.setProperty('--color-b', `127`);
                                
                                resolve('');
                            }
                        }).catch(() => {
                            document.body.style.setProperty('--color-r', `127`);
                            document.body.style.setProperty('--color-g', `127`);
                            document.body.style.setProperty('--color-b', `127`);
                            
                            resolve('');
                        });
                    }
                    else {
                        document.body.style.setProperty('--color-r', `127`);
                        document.body.style.setProperty('--color-g', `127`);
                        document.body.style.setProperty('--color-b', `127`);
                        
                        resolve('');
                    }
                });
            },
            default: ''
        }
    },
    methods: <any>{
        togglePlay()
        {
            if (this.$store.state.playing)
            {
                this.$store.state.playing = false;
                this.$store.state.audio.pause();
            }
            else
            {
                this.$store.state.playing = true;
                this.$store.state.audio.play();
            }
        },
        prev()
        {
            this.$store.commit('prev');
        },
        next()
        {
            this.$store.commit('next');
        }
    },
    watch: <any>{
        '$store.state.current'()
        {
            this.$store.state.track = null;
            this.$store.state.playing = true;

            const listener = () =>
            {
                this.$store.state.audio.play();
                this.$store.state.audio.removeEventListener('canplay', listener);
            }

            this.$store.state.audio.addEventListener('canplay', listener);
			ipcRenderer.send('setCurrentTrack', this.$store.state.current);
        }
    },
    mounted() {
        Array.from((this.$el as HTMLElement).querySelectorAll("button")).forEach(btn => {
            btn.addEventListener("focus", function () { this.blur(); })
        });
    }
});

function resizedataURL(
    datas: string,
    encoding: string,
    wantedWidth: number,
    wantedHeight: number
): Promise<[string, { r: number, g: number, b: number }]>
{
    return new Promise(resolve =>
    {
        const img = document.createElement('img');

        img.onload = function ()
        {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            canvas.width = wantedWidth;
            canvas.height = wantedHeight;

            ctx.drawImage(img, 0, 0, wantedWidth, wantedHeight);

            const dataURI = canvas.toDataURL(encoding);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const length = data.data.length;
            const rgb = { r: 0, g: 0, b: 0 };
            let i = -4;
            let count = 0;

            while ((i += 5 * 4) < length)
            {
                ++count;
                rgb.r += data.data[i];
                rgb.g += data.data[i + 1];
                rgb.b += data.data[i + 2];
            }

            rgb.r = ~~(rgb.r / count);
            rgb.g = ~~(rgb.g / count);
            rgb.b = ~~(rgb.b / count);

            const hsp = Math.sqrt(0.299 * (rgb.r * rgb.r) + 0.587 * (rgb.g * rgb.g) + 0.114 * (rgb.b * rgb.b));
            const val = 127.5 - hsp;

            rgb.r += val;
            rgb.g += val;
            rgb.b += val;
            
            let color = Color(rgb);
            
            if (color.saturationl() < 50) {
                color = color.saturationl(50);
            }
            
            rgb.r = color.red();
            rgb.g = color.green();
            rgb.b = color.blue();

            resolve([dataURI, rgb]);
        };

        img.src = datas;
    });
}