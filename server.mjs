import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.mp4':'video/mp4','.vtt':'text/vtt','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{
 try {const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname)); if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');} const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);}catch {res.writeHead(404);res.end('Not found');}
}).listen(process.env.PORT||4173,'0.0.0.0',()=>console.log('Between is ready at http://localhost:4173'));
