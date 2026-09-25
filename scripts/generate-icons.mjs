import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
for (const [size, file] of [[16,'favicon-16x16.png'],[32,'favicon-32x32.png'],[180,'apple-touch-icon.png'],[192,'icon-192.png'],[512,'icon-512.png']]) {
  await sharp(svg).resize(size,size).png().toFile(new URL('../public/'+file, import.meta.url).pathname);
}
const sizes=[16,32,48];
const images=await Promise.all(sizes.map(s=>sharp(svg).resize(s,s).png().toBuffer()));
const header=Buffer.alloc(6+16*images.length);
header.writeUInt16LE(1,2);header.writeUInt16LE(images.length,4);
let offset=header.length;
images.forEach((data,i)=>{const at=6+16*i;header[at]=sizes[i];header[at+1]=sizes[i];header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(data.length,at+8);header.writeUInt32LE(offset,at+12);offset+=data.length;});
await writeFile(new URL('../public/favicon.ico',import.meta.url),Buffer.concat([header,...images]));
