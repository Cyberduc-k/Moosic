import * as cp from "child_process";
import * as path from "path";

const LoaderProcess = cp.fork(path.resolve(__dirname, "loader.js"), [], { stdio: ["pipe", "pipe", "pipe", "ipc"] });

LoaderProcess.setMaxListeners(1000);

LoaderProcess.stdout!.on("data", d =>
{
    try
    {
        console.log(JSON.parse(d.toString()));
    } catch (e)
    {
        console.log(d.toString());
    }
});

export default function load(filename: string): Promise<{ title: string, album: string, artist: string, duration: number, url: string }>
{
    return new Promise((resolve) =>
    {
        let id = Math.round(Math.random() * 10000);

        LoaderProcess.addListener("message", req);

        function req(m: any)
        {
            if (m.id === id)
            {
                LoaderProcess.removeListener("message", req);
                resolve(m.data);
            }
        }

        LoaderProcess.send({ id, filename });
    });
}

export function loadImage(filename: string): Promise<[string, string]>
{
    return new Promise((resolve, reject) =>
    {
        let id = Math.round(Math.random() * 10000);

        LoaderProcess.addListener("message", req);

        function req(m: any)
        {
            if (m.id === id)
            {
                LoaderProcess.removeListener("message", req);

                if (m.error) reject(m.error);
                else resolve(m.data);
            }
        }

        LoaderProcess.send({ id, get: "image", filename });
    });
}