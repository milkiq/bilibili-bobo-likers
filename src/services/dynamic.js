const { default: axios } = require('axios');
const { sleep } = require('../utils/index.js');

async function getLastTenDynamicTids(uid) {
  const res = await axios.get(`https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${uid}`)
    .then(res => res.data);
  return (res?.data?.items ?? [])
    .filter(e => e?.modules?.module_tag?.text !== '置顶')
    .slice(0, 10)
    .map(e => e.id_str);
}

async function getLikersUid(tid) {
  const res = await axios.get(`https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=${tid}&`)
    .then(res => res.data);
  const likes = res.data.item.modules.module_stat.like.count;
  let uids = [];
  let actions = [];
  for (let i = 1; (i - 1) * 20 < likes; i++) {
    actions.push(
      axios.get(`https://api.vc.bilibili.com/dynamic_like/v1/dynamic_like/spec_item_likes?dynamic_id=${tid}&pn=${i}&ps=20`)
        .then(res => res.data)
        .then(res => {
          return res.data?.item_likes?.map(e => e.uid) ?? [];
        })
    );
    // 每一百页一起发请求
    if (actions.length >= 10 || i * 20 >= likes) {
      try {
        console.log(`>>> 正在获取uid，获取${i}页`);
        const results = await Promise.all(actions);
        uids = uids.concat(...results);
        actions = [];
        // 接口请求太频繁会导致失败，所以休眠一秒
        await sleep(500);
      } catch {
        console.log(`${i}页请求失败`);
      }
    }
  }
  return uids;
}

module.exports = {
  getLastTenDynamicTids,
  getLikersUid,
};
