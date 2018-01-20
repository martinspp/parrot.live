const fs = require('mz/fs');
const http = require('http');
const {Readable} = require('stream');
const colors = require('colors/safe');

const frames = [];

// Setup frames in memory
fs.readdir('./frames').then(data => { 
  data.forEach(async frame => {
    const f = await fs.readFile(`./frames/${frame}`);
    frames.push(f.toString());
  })
});

const colorsOptions = ['\033[0;31m', '\033[0;33m', '\033[0;32m', '\033[0;34m', '\033[0;35m', '\033[0;36m', '\033[0;37m'];
const numColors = colorsOptions.length;

const streamer = stream => {
  let index = 0;
  let lastColor = -1;
  let newColor = 0;
  return setInterval(() => {
    if (index >= frames.length) index = 0; stream.push('\033c');

    newColor = Math.floor(Math.random() * numColors);

    // Reroll for a new color if it was the same as last frame
    if(newColor == lastColor) {
      newColor += (1 + Math.floor(Math.random() * (numColors - 1)));
      newColor %= numColors;
    }

    lastColor = newColor;3
    chunk = colorsOptions[newColor] + frames[index]
    stream.push(chunk);

    index++;
  }, 150);
}

const server = http.createServer((req, res) => {
  if (req.headers && req.headers['user-agent'] && !req.headers['user-agent'].includes('curl')) {
    res.writeHead(302, {'Location': 'https://www.youtube.com/channel/UCnC0dVY8QJtBAoM1G5lVLwg'});
    return res.end();
  }
  const stream = new Readable();
  stream._read = function noop () {};
  stream.pipe(res);
  const interval = streamer(stream);

  req.on('close', () => {
    stream.destroy();
    clearInterval(interval);
  });
});


const port = process.env.PARROT_PORT || 3000;
server.listen(port, err => {
  if (err) throw err;
  console.log(`Listening on locahost:${port}`);
});
