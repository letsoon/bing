const fs = require('fs');
const path = require('path');
const axios = require('axios');

let data = {};

if(fs.existsSync(path.join(__dirname, 'data.json'))){
  data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'),{encoding: 'utf8'}));
  console.log(data)
}

const domain = "https://bing.com";

axios.get(`${domain}/HPImageArchive.aspx?format=js&idx=-1&n=1`).then(res=>{
  const picData = res.data.images[0];
  const {urlbase,copyright: desc} = picData;
  data[picData.enddate] = {
    url: `${domain}${urlbase}_1920x1080.jpg`,
    desc
  }
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data));
})
