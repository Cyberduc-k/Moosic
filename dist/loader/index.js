"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cp = __importStar(require("child_process"));
const path = __importStar(require("path"));
const LoaderProcess = cp.fork(path.resolve(__dirname, "loader.js"), [], { stdio: ["pipe", "pipe", "pipe", "ipc"] });
LoaderProcess.setMaxListeners(1000);
LoaderProcess.stdout.on("data", d => {
    try {
        console.log(JSON.parse(d.toString()));
    }
    catch (e) {
        console.log(d.toString());
    }
});
function load(filename) {
    return new Promise((resolve) => {
        let id = Math.round(Math.random() * 10000);
        LoaderProcess.addListener("message", req);
        function req(m) {
            if (m.id === id) {
                LoaderProcess.removeListener("message", req);
                resolve(m.data);
            }
        }
        LoaderProcess.send({ id, filename });
    });
}
exports.default = load;
function loadImage(filename) {
    return new Promise((resolve, reject) => {
        let id = Math.round(Math.random() * 10000);
        LoaderProcess.addListener("message", req);
        function req(m) {
            if (m.id === id) {
                LoaderProcess.removeListener("message", req);
                if (m.error)
                    reject(m.error);
                else
                    resolve(m.data);
            }
        }
        LoaderProcess.send({ id, get: "image", filename });
    });
}
exports.loadImage = loadImage;
