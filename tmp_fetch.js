const roundId = "9c330219-7d2a-4582-ad09-b9491a5fe233";
fetch(`https://results4x4.com/api/v1/public/rounds/${roundId}/leaderboard?mode=final`).then(r => { console.log('status', r.status); return r.json(); }).then(j => { console.log(j.rows?.slice(0,5)); console.log('rows', j.rows?.length); }).catch(console.error);
