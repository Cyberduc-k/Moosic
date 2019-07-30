"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = __importDefault(require("../component"));
const electron_1 = require("electron");
exports.default = component_1.default({
    template: '#titlebar-template',
    data() {
        return {
            globals: require("./globals")
        };
    },
    methods: {
        minimize() {
            electron_1.remote.getCurrentWindow().minimize();
        },
        close() {
            electron_1.ipcRenderer.send('dialogResult', null);
            electron_1.remote.getCurrentWindow().close();
        }
    }
});
