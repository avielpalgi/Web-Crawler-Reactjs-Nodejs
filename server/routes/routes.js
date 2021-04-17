const express = require('express')
const request = require('request');
const axios = require("axios");
const cheerio = require('cheerio');
const fs = require('fs');
var async = require("async");
const { response } = require('express');
const router = express.Router()
var count = 2;
var resArray = [];
var depth = 0;
var webUrl = "";
var linkslist = [];
var textslist = [];
var ifFinishAll = false;

function isUrlValid(userInput) {
  var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (res == null)
    return false;
  else
    return true;
}

router.post('/urls', (req, res) => {
  count = 2;
  resArray = [];
  linkslist = [];
  textslist = [];
  ifFinishAll = false;
  webUrl = req.body.url;
  depth = req.body.depth;
  recursiveFetch(webUrl,res);
  if (depth<3) {
    setTimeout(() => {
      res.send(resArray);
    },2000);
  }
  else{
    setTimeout(() => {
      res.send(resArray);
    },6000);
  }
 
});

async function recursiveFetch(webUrl,res) {
  while (!ifFinishAll) {
    if (count <= depth) {
      count++;
      if (linkslist.length < 1) {
       const result = await fetchData(webUrl)
       if (result) {
        recursiveFetch(webUrl,res);
       }
      }
      else {
        for (let i = 0; i < linkslist.length; i++) {
          const element = linkslist[i].toString();
          fetchData(encodeURI(element))
        }
      }
    }
    else {
      ifFinishAll = true;
    }
  }
}

async function fetchData(webUrl) {
  return new Promise(resolve => {
  axios.get(webUrl)
    .then(function (response) {
      const $ = cheerio.load(response.data);
      const linkObjects = $('a');
      const links = [];
      linkObjects.each((index, element) => {
        var strHref = $(element).attr('href');
        var strText = $(element).text();
        var existUrl = linkslist.includes(strHref);
        var existText = textslist.includes(strText);
        if (strText !== "" && strText !== null && strHref !== "" && strHref !== null && strHref !== undefined && !existUrl && !existText) {
          var tel = strHref.startsWith("tel");
          var mail = strHref.startsWith("mailto");
          var linkInStart = isUrlValid(strHref);
          if (!tel && !mail) {
            if (linkInStart) {
              links.push({
                text: $(element).text(), // get the text
                href: $(element).attr('href'), // get the href attribute
              });
              linkslist.push($(element).attr('href'));
              textslist.push($(element).text());
            }
            else {
              links.push({
                text: $(element).text(), // get the text
                href: webUrl.toString() + $(element).attr('href'), // get the href attribute
              });
              linkslist.push(webUrl.toString() + $(element).attr('href'))
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
      if (result.length > 0) {
        resArray.push({ depth: count - 1, list: result });
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
      resolve(true);
      //recursiveFetch(webUrl);
    });
  });
};


module.exports = router