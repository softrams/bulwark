export class VulnFormEvent {

    constructor(
        private id: number,
        public impact: string,
        public likelihood: string,
        public risk: string,
        public systemic: string,
        public status: string,
        public description: string,
        public remediation: string,
        public name: string,
        public assessmentId: number,
        public jiraId: number,
        public cvssScore: number,
        public cvssUrl: string,
        public detailedInfo: string
    ) {}

}