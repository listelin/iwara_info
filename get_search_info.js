'use strict';
process.env.UV_THREADPOOL_SIZE = 128;

const fs = require('fs');
const iwara = require('./iwara2.js');
let contents = [];
let gotpage = 0;
const baseurl = "https://ecchi.iwara.tv/search?f%5B0%5D=type%3Avideo";

// 日付整形面倒なので強制的に9時間追加
let d = new Date();
d.setHours(d.getHours() + 9);
let outfn = "isl_v2_full_" + d.toISOString().replace(/[:\-]/g, '').replace(/T/, '_').replace(/\..+/g, '');

if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp');
}

let maxpage = 0;
iwara.last_page(baseurl, (lastpage) => {
    maxpage = lastpage;
    console.log("maxpage=" + lastpage);
    getpage(maxpage, gotpage);
});


function getpage(maxcount, i) {
    if (i < maxcount) {
        let url = (i == 0) ? baseurl : baseurl + "&page=" + i;
        console.log("page=" + i + " " + url);
        iwara.list_search_contents(url, (cl) => {
            console.log("got paget=" + i + " n_page_content=" + cl.length + "  total=" + contents.length);
         //   fs.writeFileSync("temp/" + outfn + "-" + i + ".json", JSON.stringify(cl));
            contents.push(...cl);
            gotpage++;
            if (gotpage === maxpage) {
                console.log("write json file");
                fs.writeFileSync(outfn + ".json", JSON.stringify(contents));
            }
        });
        setTimeout(() => {
            getpage(maxcount, ++i);
        }, 3000);
    }
}

