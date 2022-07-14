const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const dayjs = require('dayjs');
const schedule = require('node-schedule');
const { getLikersUid } = require('./services/dynamic.js');


function updateGitRemote() {
  shell.cd(__dirname);
  shell.exec('git add .');
  shell.exec(`git commit -m "${dayjs().format('YYYY-MM-DD HH:mm:ss')} update likers"`);
  shell.exec('git push origin master');
}

const job = schedule.scheduleJob('* * 2 * * *', async function() {
  const uids = getLikersUid('662016827293958168');
  const file = path.resolve(__dirname, '../likers.json');
  fs.writeFileSync(file, JSON.stringify(uids ?? []));

  updateGitRemote();
  console.log('The answer to life, the universe, and everything!');
});
