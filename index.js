const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const process = require('process');
const { argv } = process;

const cookie_base64 = argv[2].replace('--cookie=','');
const cookie = Buffer.from(cookie_base64, 'base64').toString();
console.log(cookie);

let data = {};

const domain = "https://bing.com";

let todayPic = [];

const position = [
  { "name": "中国", "code": "zh-cn" },
  { "name": "美国", "code": "en-us" },
  { "name": "英国", "code": "en-gb" },
  { "name": "德国", "code": "de-de" },
  { "name": "法国", "code": "fr-fr" },
  { "name": "日本", "code": "ja-jp" },
];

if(fs.existsSync(path.join(__dirname, 'data.json'))){
  const content = fs.readFileSync(path.join(__dirname, 'data.json'),{encoding: 'utf8'});
  data = content ? JSON.parse(content) : data;
}

function uploadToBiliBili(todayPic,idx){
  exec(`curl '${todayPic[idx].url1}' -o '${idx}.jpg'`,(error,std,stderr)=>{
    if (error) {
      throw `exec error: ${error}`;
    }
    console.log(`${todayPic[idx].name}-图片保存成功`);
    exec(`curl 'http://api.vc.bilibili.com/api/v1/drawImage/upload' -F 'file_up=${idx}.jpg' -F 'category=daily' -b '${cookie}'`,(error,std,stderr)=>{
      if (error) {
        throw `exec error: ${error}`;
      }
      const res = JSON.parse(std);
      if(res.code !== 0){
        throw `${todayPic[idx].name}-图片上传失败：${res.message}`;
      }
      console.log(`${todayPic[idx].name}-图片上传成功`);
      todayPic[idx].bilibili = res.data;
      if(idx < todayPic.length - 1){
        uploadToBiliBili(todayPic, idx + 1);
      }else{
        data[picData.enddate] = todayPic;
        fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data));
      }
    })
  })
}

function getToday(idx=0){
  const {name,code} = position[idx];
  exec(`curl '${domain}/HPImageArchive.aspx?format=js&idx=-1&n=1' -b '_EDGE_S=mkt=${code}'`,(error,std,stderr)=>{
    if (error) {
      throw `exec error: ${error}`;
    }
    const res = JSON.parse(std);  
    const picData = res.images[0];
    const {urlbase,copyright: desc} = picData;
    const url1 = `${domain}${urlbase}_UHD.jpg&rf=LaDigue_UHD.jpg&pid=hp&w=1920&h=1080&rs=1&c=4`;
    const url2 = `${domain}${urlbase}_UHD.jpg&rf=LaDigue_UHD.jpg&pid=hp&w=2560&h=1440&rs=1&c=4`;
    const url3 = `${domain}${urlbase}_UHD.jpg&rf=LaDigue_UHD.jpg&pid=hp&w=3840&h=2160&rs=1&c=4`;
    const today = {name,code,url1,url2,url3,desc};
    todayPic.push(today);
    console.log(`${name}-链接获取成功`);
    if(idx < position.length - 1){
      getToday(idx + 1);
    }else{
      uploadToBiliBili(todayPic, 0);
    }
  })
}

getToday(0);
