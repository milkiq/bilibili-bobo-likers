const fs = require('fs');
const path = require('path');
const { getLastTenDynamicTids, getLikersUid } = require('./services/dynamic');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(`请输入名字和uid：`, async str => {
  const [name, uid] = str.split(' ').map(s => s.trim());
  const tids = await getLastTenDynamicTids(uid);
  let uids = [];

  for (const tid of tids) {
    const currentUids = await getLikersUid(tid);
    uids = [].concat(uids, currentUids);
  }
  uids = Array.from(new Set(uids));

  const file = path.resolve(__dirname, `../${name}-${uid}.json`);
  fs.writeFileSync(file, JSON.stringify(uids ?? []));
  readline.close()
});
