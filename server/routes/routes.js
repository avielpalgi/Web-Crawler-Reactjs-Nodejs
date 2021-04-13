const express = require('express')
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const { response } = require('express');
const router = express.Router()
var count = 2;
var resArray = [];
var depth = 0;
var webUrl = "";
var linkslinst = [];
var textslist = [];
var ifFinishAll = false;
function isUrlValid(userInput) {
  var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (res == null)
    return false;
  else
    return true;
}

router.post('/urls', (req, response) => {
  count = 2;
  webUrl = req.body.url;
  depth = req.body.depth;
  if (!ifFinishAll) {
    letstart(webUrl, response);
  }
  else {
    console.log("Finish");
  }
})

 function letstart(urlLink, response) {
  request(urlLink, function (error, res, body) {
    console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
    //console.log('body:', body); // Print the HTML for the Google homepage.
    if (!error) {
      getLinks(body);
      if (!ifFinishAll) {
        console.log('count', count);
       GetinsideLinks(linkslinst, response);
      }
      else {
        console.log("Finish crawl");
      }
    }
    else {
      console.log("sorry");
      return "sorry";
    }
  });
  console.log("yeshhhhh");
}

function getLinks(body) {
  const html = body;
  const $ = cheerio.load(html);
  const linkObjects = $('a');
  const links = [];
  linkObjects.each((index, element) => {
    countLinks = linkObjects.length;
    var strHref = $(element).attr('href');
    var strText = $(element).text();
    var existUrl = linkslinst.includes(strHref);
    var existText = textslist.includes(strText);
    if (strText !== '' && strText !== "" && strText !== null && strHref !== '' && strHref !== "" && strHref !== null && strHref !== undefined && !existUrl && !existText) {
      var tel = strHref.startsWith("tel");
      var mail = strHref.startsWith("mailto");
      var linkInStart = strHref.includes("http") || strHref.includes("www");
      var linkInStart2 = isUrlValid(strHref);
      if (!tel && !mail) {
        if (linkInStart) {
          links.push({
            text: $(element).text(), // get the text
            href: $(element).attr('href'), // get the href attribute
          });
          linkslinst.push($(element).attr('href'));
          textslist.push($(element).text());
        }
        else {
          links.push({
            text: $(element).text(), // get the text
            href: webUrl.toString() + $(element).attr('href'), // get the href attribute
          });
          linkslinst.push(webUrl.toString() + $(element).attr('href'))
          textslist.push($(element).text());
        }
      }
    }
  });
  const result = [];
  const map = new Map();
  for (const item of links) {
    if (!map.has(item.text)) {
      map.set(item.text, true);    // set any value to Map
      result.push({
        text: item.text,
        href: item.href
      });
    }
  }
  //organizeList(resArray);
  //organizeList(linkslinst);
  if (result.length > 0) {
    resArray.push({ list: result, depth: count - 1 });
  }
  console.log('res', resArray);
}

function organizeList(list) {

}

function GetinsideLinks(list, response) {
  const promise = new Promise((resolve, reject) => {
      count++;
      if (count <= depth) {
        for (let i = 0; i < list.length; i++) {
          const link = list[i].toString();
          var includeUrl = link.includes(webUrl);
          if (!includeUrl) {
            request(link, function (error, res, body) {
              console.error('error2:', error); // Print the error if one occurred
              console.log('statusCode2:', res && res.statusCode); // Print the response status code if a response was received
              if (!error) {
                getLinks(body);
              }
              else {
                console.log("sorry2");
              }
            });
          }
        }
        ifFinishAll = true;
        //response.status(200).send(resArray);
      }
      else {
        ifFinishAll = true;
        response.status(200).send(resArray);
      }; 
    })
    promise.then(res => {
      console.log('ddx',res)
    }).catch(err => {
      console.log(err)
    }) 
}


module.exports = router