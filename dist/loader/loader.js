"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mm = __importStar(require("music-metadata"));
const path = __importStar(require("path"));
function loadTrack(filename) {
    return new Promise((resolve, reject) => {
        let title = "";
        let artist = "";
        let album = "";
        let duration = 0;
        mm.parseFile(filename).then(metadata => {
            title = metadata.common.title || path.basename(filename, path.extname(filename));
            artist = metadata.common.artist || "";
            album = metadata.common.album || "";
            duration = metadata.format.duration || 0;
            resolve({
                title,
                artist,
                album,
                duration,
                url: filename
            });
        }).catch(err => {
            reject(err);
        });
    });
}
function loadImage(filename) {
    return new Promise((resolve, reject) => {
        mm.parseFile(filename, { native: true }).then(metadata => {
            resolve([metadata.common.picture[0].format, metadata.common.picture[0].data.toString("base64")]);
        }).catch(err => {
            reject(err);
        });
    });
}
process.on("message", m => {
    if (m.get == "image") {
        loadImage(m.filename).then(data => {
            process.send({ id: m.id, data });
        }).catch(err => {
            process.send({ id: m.id, error: err });
        });
    }
    else {
        loadTrack(m.filename).then(data => {
            process.send({ id: m.id, data });
        });
    }
});
