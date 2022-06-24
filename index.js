
const fs = require('fs');
const path = require('path');

const qrcode = require('qrcode-terminal');
// const axios = require('axios');
const express = require('express');
const upload = require('express-fileupload');
const qrimg = require('node-qr-image');

//port request
const port = 5000;
var app = express();
app.set('view engine', 'ejs');``
app.use('/public', express.static('media'));
app.use(upload());

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth()
});
var conn = false;
var generated = false;
var temp;

const directory = 'media/temps';
fs.readdir(directory, (err, files) => {
  if (err) throw err;
  for (const file of files) {
    if(parseInt(new Date().getTime()/1000)-3600 > parseInt(file.split(".")[0])){
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
    }
  }
});

app.get('/', function(req, res){
    res.render('index');
});

app.get('/:temp', function(req, res){
    if(temp != req.params.temp){
        conn = false;
        generated = false;
    }
    temp = req.params.temp;
    client.on('ready', () => {
        console.log('Client is ready!');
        conn = true;
    });
    if(!conn){
        client.on('qr', qr => {
            qrcode.generate(qr, {small: true});
            var qr_svg = qrimg.image(qr, { type: 'svg' });
            qr_svg.pipe(require('fs').createWriteStream('./' + directory + '/' + temp + '.svg'));
            var svg_string = qrimg.imageSync(qr, { type: 'svg' });
            generated = true;
        });
    }
    res.render('qr_generator', {temp: temp, connect: conn, generated: generated});
});

client.on('message', async message => {
    const content = message.body
    // client.sendMessage(message.from, 'Hi Dear Client ...');
    if(content === '.1') {
        message.reply('answered');
        client.sendMessage(message.from, 'answer 1');
    }else if(content === '.2') {
        message.reply('answered');
        // const png = await axios("https://").then(res => res.data)
        const png = MessageMedia.fromFilePath('./media/files/file-sample.pdf');
        client.sendMessage(message.from, 'answer 2');
        client.sendMessage(message.from, png);
    };
});

client.initialize();
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });