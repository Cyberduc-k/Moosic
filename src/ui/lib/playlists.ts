import Component from "../component";
import { Playlist } from "../../store.lib";
import { remote, ipcRenderer } from "electron";
const { Menu, MenuItem, getCurrentWindow } = remote;

export default Component({
    template: '#playlists-template',
    data() {
        // const instance = this;
        
        return {
            options: {
                dropzoneSelector: '#playlists ul',
                draggableSelector: '#playlists .playlist:not(.default)',
                multipleDropzonesItemsDraggingEnabled: false,
            }
        }
    },
    computed: {
        playlists(): Playlist[]
        {
            return this.$store.state.playlists;
        }
    },
    methods: {
        contextmenu(i: number, e: MouseEvent) {
            const self = this;
            const menu = new Menu();
        
            menu.append(new MenuItem({
                label: "Rename",
                click() {
                    ipcRenderer.send('openDialog', 1, self.$store.state.playlists[i].name);
                    ipcRenderer.on('dialogResult', listener);
    
                    function listener(_: any, res: string | null): void
                    {
                        if (res !== null)
                        {
                            self.$store.state.playlists[i].name = res;
                        }
                        
                        ipcRenderer.removeListener('dialogResult', listener);
                    }
                }
            }));
            
            menu.append(new MenuItem({
                label: "Remove",
                click() {
                    self.playlists.splice(i, 1);
                }
            }));
            
            menu.popup({
                x: e.clientX,
                y: e.clientY,
                window: getCurrentWindow()
            });
        },
        reordered(e: CustomEvent<{ index: number, items: HTMLElement[] }>) {
            let pl = <Playlist[]>this.$store.state.playlists;
            let i = 0;
            
            for (i; i < pl.length; i++) {
                if (pl[i].name == e.detail.items[0].innerText) {
                    break;
                }
            }
            
            let [elem] = pl.splice(i, 1);
            
            pl.splice(e.detail.index + 1, 0, elem);
        }
    }
});