'use strict';

const request = require('request')
const { JSDOM } = require('jsdom')
const fs = require('fs'); // for debug

var iwaraUtil = {
    list_contents: function (iwara_url, cb) {

        let videoInfos = [];
        request(iwara_url, (e, response, body) => {
            if (e) { console.error(e) }

            try {
                let checkdate = Date();
                const dom = new JSDOM(body)
                var videoNodes = dom.window.document.querySelectorAll('.node-video')

                for (let i = 0; i < videoNodes.length; i++) {
                    var href = videoNodes[i].querySelector('.title a').href;
                    var id = href.replace(/^.*\/videos\//, '').replace(/\?.+$/, '');
                    try {
                        var title = videoNodes[i].querySelectorAll('a img')[0].getAttribute('title');
                    } catch (e) {
                        var title = videoNodes[i].querySelector('h3.title a').text
                    }
                    var user = videoNodes[i].querySelector('.username').text;

                    var likeicon = videoNodes[i].querySelector('.right-icon');
                    var like = likeicon ? parseInt(likeicon.textContent) : 0;

                    var viewicon = videoNodes[i].querySelector('.left-icon');
                    if (viewicon) {
                        if (viewicon.textContent.match(/k/)) {
                            var view = parseFloat(viewicon.textContent.replace(/k/, '')) * 1000;
                        } else {
                            var view = parseInt(viewicon.textContent)
                        }
                    } else {
                        var view = 0;
                    }

                    let c = {
                        "id": id,
                        "user": user,
                        "title": title,
                        "like": like,
                        "view": view,
                        "checkdate": checkdate
                    };
                    videoInfos.push(c);
                };
            } catch (e) {
                console.error(e);
                console.log("url=" + iwara_url + "i=" + i + "node=" + videoNodes[i]);
            }
            cb(videoInfos)

        })

    },
    list_search_contents: function (iwara_url, cb) {

        let videoInfos = [];
        request(iwara_url, (e, response, body) => {
            if (e) { console.error(e) }

            //            fs.writeFileSync("temp.html", body);
            let d = new Date();
            d.setHours(d.getHours() + 9);
            let checkdate = d.toISOString().replace(/T/, ' ').replace(/\..+/g, '');

            try {
                const dom = new JSDOM(body)
                var videoNodes = dom.window.document.querySelectorAll('.node-video')

                for (let i = 0; i < videoNodes.length; i++) {
                    var href = videoNodes[i].querySelector('.title a').href;
                    var id = href.replace(/^.*\/videos\//, '').replace(/\?.+$/, '');
                    try {
                        var title = videoNodes[i].querySelectorAll('a img')[0].getAttribute('title');
                    } catch (e) {
                        var title = videoNodes[i].querySelector('h3.title a').text
                    }
                    var user = videoNodes[i].querySelector('.username').text;

                    // page_sdatestrはUTCなので＋９時間する
                    var page_sdatestr = videoNodes[i].querySelector('.submitted').textContent.replace(/.+作成日:/, '');
                    var m = page_sdatestr.match(/(\d{4})\-(\d{2})\-(\d{2})\s(\d{2}):(\d{2})/);
                    var year = parseInt(m[1]);
                    var month = parseInt(m[2]) - 1;
                    var day = parseInt(m[3]);
                    var hour = parseInt(m[4]) + 17; // このあとJSTでnewされるのでISOにすると-9される？原因不明だが+17であう
                    var min = parseInt(m[5]);
                    var sdate = new Date(year, month, day, hour, min);
                    var sdatestr = sdate.toISOString().replace(/T/, ' ').replace(/\..+/, '');

                    var view_like = videoNodes[i].querySelector('.video-info').textContent.match(/([\d\.\,\k]+)\s+([\d\.\,\k]+)*/);
                    var like = view_like[2] === undefined ? 0 : parseInt(view_like[2].replace(/,/, ''));

                    var viewstr = view_like[1] === undefined ? "0" : view_like[1].replace(/,/, '');
                    if (viewstr.match(/k/)) {
                        var view = (parseFloat(viewstr).replace(/k/, '')) * 1000;
                    } else {
                        var view = parseInt(viewstr)
                    }

                    var ols = videoNodes[i].querySelectorAll('.field-items a')
                    var otherlinks = [];
                    for (let i = 0; i < ols.length; i++) {
                        otherlinks.push(ols[i].href);
                    }

                    let thumburl = '';
                    try {
                        thumburl = 'https:' + videoNodes[i].querySelector('img').src;
                        thumburl = thumburl.replace(/https:\/sites\//, 'https://ecchi.iwara.tv./sites/')

                    } catch (e) {
                    }

                    let c = {
                        "id": id,
                        "user": user,
                        "title": title,
                        "like": like,
                        "view": view,
                        "sdate": sdatestr,
                        'checkdate': checkdate,
                        'thumburl': thumburl,
                        "otherlinks": otherlinks
                    };
                    videoInfos.push(c);
                };
            } catch (e) {
                console.error(e);
                console.log("url=" + iwara_url + "i=" + i + "node=" + videoNodes[i]);
            }
            cb(videoInfos);

        })

    },

    last_page: function (iwara_url, cb) {
        let lastpage = 0;
        request(iwara_url, (e, response, body) => {
            if (e) { console.error(e) }
            try {
                const dom = new JSDOM(body)
                lastpage = parseInt(dom.window.document.querySelector('.pager-last a').href.replace(/^.+page=/, ''));
            } catch (e) {
                console.log('last page parse error' + e);
            }
            cb(lastpage);
        });
    },

    page_info: function (iwara_url, cb) {
        request(iwara_url, (e, response, body) => {
            if (e) { console.error(e) }

            let c = {};
            try {
                let checkdate = Date();
                const d = new JSDOM(body);
                let dom = d.window.document

                let id = dom.querySelector('[rel="canonical"]').href.replace(/^.*\/videos\//, '').replace(/\?.+$/, '');
                let user = dom.querySelector('.username').text;
                let title = dom.querySelector('.title').textContent;
                let submitted = dom.querySelector('.submitted').textContent;
                let createdate = "";
                let m;
                if (m = submitted.match(/作成日:([0-9\-]+ [0-9:]+)/)) {
                    createdate = m[1];
                }


                let viewlike = dom.querySelector('.node-views').textContent
                let like = 0;
                let view = 0;
                if (m = viewlike.match(/([0-9,k\.]+)[^\d]+([0-9,k\.]+)/)) {
                    like = parseInt(m[1].replace(/,/, ''));
                    let viewtext = m[2].replace(/,/, '');
                    view = parseInt(viewtext)
                }

                let dllink;
                try {
                    dllink = dom.querySelector('#download-options li a').href
                } catch (e) {
                    dllink = "not found";
                }
                let opt_links = [];
                let l = dom.querySelectorAll('.field-type-text-with-summary a');
                for (let i = 0; i < l.length; i++) {
                    opt_links.push(l[i].href);
                }

                c = {
                    "id": id,
                    "user": user,
                    "title": title,
                    "like": like,
                    "view": view,
                    "dllink": dllink,
                    "opt_links": opt_links,
                    "createdate": createdate,
                    "checkdate": checkdate
                };

            } catch (e) {
                console.error(e);
            }
            cb(c)

        })

    },
    download_file: function (url, outFn) {
        //        console.log("start dl:" + url + "  ->  " + outFn)
        request(
            { method: 'GET', url: url, encoding: null },
            function (error, response, body) {
                if (error) {
                    console.log("thumb err dl:" + url + "  ->  " + outFn)
                    console.log("err:", error)
                }

                if (!error && response.statusCode === 200) {

                    console.log("finish dl:" + url + "  ->  " + "[" + outFn + "]")

                    fs.writeFileSync(outFn, body, 'binary');
                }
            }
        );
    }
}

module.exports = iwaraUtil;