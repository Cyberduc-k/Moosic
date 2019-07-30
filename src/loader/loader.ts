import * as mm from "music-metadata";
import * as path from "path";

function loadTrack(filename: string): Promise<{ title: string, album: string, artist: string, duration: number, url: string }>
{
    return new Promise((resolve, reject) =>
    {
        let title: string = "";
        let artist: string = "";
        let album: string = "";
        let duration: number = 0;

        mm.parseFile(filename).then(metadata =>
        {
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
        }).catch(err =>
        {
            reject(err);
        });
    });
}

function loadImage(filename: string): Promise<[string, string]>
{
    return new Promise((resolve, reject) =>
    {
        mm.parseFile(filename, { native: true }).then(metadata =>
        {
            resolve([metadata.common.picture![0].format, metadata.common.picture![0].data.toString("base64")]);
        }).catch(err =>
        {
            reject(err);
        });
    });
}

process.on("message", m =>
{
    if (m.get == "image")
    {
        loadImage(m.filename).then(data =>
        {
            process.send!({ id: m.id, data });
        }).catch(err =>
        {
            process.send!({ id: m.id, error: err });
        });
    }
    else
    {
        loadTrack(m.filename).then(data =>
        {
            process.send!({ id: m.id, data });
        });
    }
});