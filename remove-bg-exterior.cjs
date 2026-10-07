const { Jimp } = require('jimp');

async function processImage() {
  console.log('Loading image...');
  // Read the original image from the artifacts folder
  const image = await Jimp.read('C:/Users/ASUS/.gemini/antigravity/brain/8d9cc69f-74c4-42c1-a2a4-8d3d04dd7e81/safwa_favicon_1791373576594.jpg');
  
  // Resize to 256x256 first for speed and to act as a proper favicon size
  image.resize({ w: 256, h: 256 });
  
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const visited = new Uint8Array(width * height);
  
  // Start from the 4 corners
  const queue = [
    {x: 0, y: 0}, 
    {x: width-1, y: 0}, 
    {x: 0, y: height-1}, 
    {x: width-1, y: height-1}
  ];
  let qIdx = 0;
  
  function getIdx(x, y) {
    return (y * width + x) * 4;
  }
  
  function isWhiteLike(x, y) {
    const idx = getIdx(x, y);
    const r = image.bitmap.data[idx];
    const g = image.bitmap.data[idx+1];
    const b = image.bitmap.data[idx+2];
    // Threshold for white-ish background
    return (r > 240 && g > 240 && b > 240);
  }
  
  console.log('Processing exterior background...');
  while(qIdx < queue.length) {
    const p = queue[qIdx++];
    const x = p.x;
    const y = p.y;
    
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    
    const vIdx = y * width + x;
    if (visited[vIdx]) continue;
    visited[vIdx] = 1;
    
    if (isWhiteLike(x, y)) {
      const idx = getIdx(x, y);
      image.bitmap.data[idx + 3] = 0; // Set Alpha to 0 (transparent)
      
      queue.push({x: x+1, y});
      queue.push({x: x-1, y});
      queue.push({x, y: y+1});
      queue.push({x, y: y-1});
    }
  }
  
  // Save as PNG
  await image.write('public/favicon.png');
  console.log('Exterior background removed and saved to public/favicon.png!');
}

processImage().catch(console.error);
