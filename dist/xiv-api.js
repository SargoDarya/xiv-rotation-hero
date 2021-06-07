export class XIVApi {
    static action() { }
    static search() {
        const url = `${this.BASE_URL}/search`;
    }
    static jobs() {
        const columns = [
            'ID',
            'Abbreviation',
            'BattleClassIndex',
            'Url',
            'Icon',
            'Name_en',
            'Name_ja',
            'Name_fr',
            'Name_de',
        ];
        return this.fetchAPI(`/ClassJob?columns=${columns.join()}`);
    }
    static job(id) {
        return this.fetchAPI(`/ClassJob/${id}`);
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
            'ActionCombo',
            'IconHD',
            'Cast100ms',
            'Recast100ms'
        ].join(',');
        return this.fetchAPI(`/search?indexes=action&filters=${filters}&columns=${columns}`);
    }
    static fetchAPI(request) {
        return fetch(`${this.BASE_URL}${request}`).then((response) => response.json());
    }
}
XIVApi.BASE_URL = 'https://xivapi.com';
