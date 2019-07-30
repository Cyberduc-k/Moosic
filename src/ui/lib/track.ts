import Component from "../component";
import electron from "electron";

const { Menu, MenuItem } = electron.remote;

export default Component({
    template: '#track-template',
    name: 'song',
    props: ['track', 'index'],
    computed: {
        mins(): number {
            return Math.floor((~~this.track.duration) / 60);
        },
        secs(): number | string {
            if ((~~this.track.duration) % 60 < 10)
                return `${(~~this.track.duration) % 60}0`;
            else
                return (~~this.track.duration) % 60;
        }
    },
    mounted() {
        const menu = new Menu();
        
        menu.append(new MenuItem({
            label: "Remove",
            click: () => {
                const current = this.$store.state.current;
                const playlist = this.$store.state.playlists[current];
                
                playlist.tracks.splice(this.index, 1);
            }
        }));
        
        (this.$el as HTMLElement).addEventListener("contextmenu", e => {
            const x = e.clientX;
            const y = e.clientY;
            
            menu.popup({
                x,
                y,
                window: electron.remote.getCurrentWindow()
            });
        });
    }
});