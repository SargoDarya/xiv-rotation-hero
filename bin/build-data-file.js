const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 4, perMilliseconds: 1000, maxRPS: 4 });
const fs = require('fs');

class XIVApi {
  static jobs() {
      const columns = [
          'ID',
          'Abbreviation',
          'BattleClassIndex',
          'ClassJobParentTargetID',
          'Url',
          'Icon',
          'Name_en',
          'Name_ja',
          'Name_fr',
          'Name_de',
      ];
      return this.getAPI(`/ClassJob?columns=${columns.join()}`).then((response) => response.Results);
  }
  static actionsForJob(job) {
      const filters = [
          `ClassJobTargetID|=${job.ID};${job.ClassJobParentTargetID}`,
          `ClassJobCategory.${job.Abbreviation}=1`,
          `IsPvP=0`
      ].join(',');
      const columns = [
        'ID',
        'Name',
        'Description',
        'ClassJobLevel',
        'CooldownGroup',
        'ActionComboTargetID',
        'IconHD',
        'Cast100ms',
        'Recast100ms',
        'PreservesCombo',
        'PrimaryCostType',
        'PrimaryCostValue'
      ].join(',');
      return this.getAPI(`/search?indexes=action&filters=${filters}&columns=${columns}`).then((response) => response.Results);
  }
  static getAPI(request) {
      return http.get(`${this.BASE_URL}${request}`).then((response) => response.data);
  }
}
XIVApi.BASE_URL = 'https://xivapi.com';

async function main() {
  console.log('Fetching jobs...');
  const jobs = await XIVApi.jobs();

  console.log('Fetching job actions...');
  const jobsActions = await Promise.all(jobs.map((job) => XIVApi.actionsForJob(job)));

  console.log('Writing files');
  fs.writeFileSync('./src/assets/classjobs.json', JSON.stringify(jobs));
  fs.writeFileSync('./src/assets/classjobactions.json', JSON.stringify(jobs.reduce((prev, job, index) => {
    prev[ job.ID ] = jobsActions[ index ];
    return prev;
  }, {})));

  console.log('Done');
}

main();
