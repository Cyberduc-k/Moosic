"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = __importDefault(require("vue"));
const dialog_1 = require("../ui/dialog");
const electron_1 = require("electron");
new vue_1.default({
    el: '#app',
    template: '#app-template',
    data: {
        globals: require("../ui/dialog/globals"),
    },
    methods: {
        cancel() {
            electron_1.ipcRenderer.send('dialogResult', null);
            electron_1.remote.getCurrentWindow().close();
        },
        done() {
            electron_1.ipcRenderer.send('dialogResult', this.globals.text.length > 0 ? this.globals.text : null);
            electron_1.remote.getCurrentWindow().close();
        }
    },
    components: {
        titlebar: dialog_1.titlebar
    }
});
