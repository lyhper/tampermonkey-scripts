// ==UserScript==
// @name         批量删除微博
// @namespace    https://github.com/lyhper
// @version      0.1
// @description  根据指定日期范围批量删除微博
// @author       lyhper
// @include      https://weibo.com/*/profile*
// @icon         https://weibo.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // 删除开始日期，使用者自定义
  const begin = '201612';
  // 删除截止日期，使用者自定义
  const end = '202010';

  function padZero(num) {
    const str = num + '';

    if (str.length < 2) {
      return `0${num}`;
    }

    return num;
  }

  function wait(time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  function jumpToDate(date) {
    const url = location.href.split('?')[0];
    location.href = `${url}?is_all=1&stat_date=${date}#feedtop`;
  }

  function getUrlParam() {
    const queryStr = location.search.slice(1);
    const arr = queryStr.split('&');
    const temp = {};

    arr.forEach((pairs) => {
        const [key, val] = pairs.split('=');

        if (key && val) {
            temp[key] = val;
        }
    });

    return temp;
  }

  async function delWeibo() {
    const urlParam = getUrlParam();
    const dateKey = 'stat_date';
    const delDate = urlParam[dateKey] || begin;

    const year = +delDate.slice(0, 4);
    const month = +delDate.slice(-2);

    const href = location.href;

    if (href.indexOf(dateKey) < 0) {
        // 不在历史发博页面
        jumpToDate(delDate);
        return;
    }

    await wait(3000);

    const midList = Array.from(
      document.body.querySelectorAll('.WB_feed_like')
    ).map((item) => item.getAttribute('mid'));

    if (midList.length > 0) {
      Promise.all(
        midList.map((mid) => {
          return fetch('https://weibo.com/aj/mblog/del?ajwvr=6', {
            body: `mid=${mid}`,
            method: 'POST',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
          })
            .then((response) => console.log(response.json()));
        })
      ).finally(() => {
        location.reload();
      });
    } else {
      if (+delDate < +end) {
        let next;

        if (month < 12) {
          next = `${year}${padZero(month + 1)}`;
        } else {
          next = `${year + 1}01`;
        }

        jumpToDate(next);
      }
    }
  }

  delWeibo();
})();
