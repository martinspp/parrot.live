const fs = require('mz/fs');
const http = require('http');
const {Readable} = require('stream');
const colors = require('colors/safe');

const animationsArray = new Object();
const animationNames = [];


fs.readdirSync('./animations/').forEach(async file => {
  createAnimation(file)
})

//get All frames
function createAnimation(name){
  animationNames.push(name);
  animationsArray[name] = getFrames(name);
}

// Setup frames in memory

function getFrames(name){
  var frames = [];
fs.readdir(`./animations/${name}`).then(data => { 
  data.forEach(async frame => {
    const f = await fs.readFile(`./animations/${name}/${frame}`);
    frames.push(f.toString());
  })
});
return frames;
}

const colorsOptions = ['red', 'yellow', 'green', 'blue', 'magenta', 'cyan', 'white'];
const numColors = colorsOptions.length;

const streamer = stream => {
  let animation = Math.floor(Math.random() * animationNames.length);
  let index = 0;
  let lastColor = -1;
  let newColor = 0;
  return setInterval(() => {

    var frames = animationsArray[animationNames[animation]]
    if (index >= frames.length) index = 0; stream.push('\033c');

    newColor = Math.floor(Math.random() * numColors);

    // Reroll for a new color if it was the same as last frame
    if(newColor == lastColor) {
      newColor += (1 + Math.floor(Math.random() * (numColors - 1)));
      newColor %= numColors;
    }

    lastColor = newColor;
    stream.push(colors[colorsOptions[newColor]](frames[index]));

    index++;
  }, 70);
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
