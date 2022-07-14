const { default: axios } = require('axios');
const { sleep } = require('../utils/index.js');

function getSuitList(pn) {
  return axios.get('https://api.bilibili.com/x/garb/v2/mall/partition/item/list', {
    params: {
      group_id: 0,
      part_id: 6,
      pn,
      ps: 20,
      sort_type: 1
    }
  }).then(res => {
    return res?.data?.data ?? { list: [], page: { total: 0 }}
  });
}

async function getAllSuitIds() {
  const { list, page } = await getSuitList(1);
  const { total } = page;
  let suits = list;

  for (let pn = 2; (pn - 1) * 20 <= total; pn++) {
    const { list } = await getSuitList(pn);
    suits = [].concat(suits, list);
  }

  return suits.map(e => e.item_id);
}

async function getAllSuits() {
  const suitIds = await getAllSuitIds();
  const rows = [];
  try {
    for (const id of suitIds) {
      const data = await axios.get('https://api.bilibili.com/x/garb/v2/mall/suit/detail', {
        params: {
          item_id: id,
          part: 'suit',
          csrf: '30db2c3edf3f5f2bdb4bd4dfb1c0c159'
        }
      }).then(res => {
        return res?.data?.data
      });
      rows.push(data);
      await sleep(800);
    }
  } catch(e) {
    console.error(e);
  }
  return rows;
}

module.exports = {
  getAllSuits
};
