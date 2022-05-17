import { ChromeAPI } from '@redhat-cloud-services/types';

const nonBetaEnvironments = [
    'ci',
    'qa',
    'stage',
    'prod',
    'gov',
    'govStage'
];

const betaEnvironments = nonBetaEnvironments.map(v => `${v}-beta`);
const environments = [ ...nonBetaEnvironments, ...betaEnvironments ];

const prodEnvironments = [ 'prod', 'prod-beta', 'gov', 'gov-beta' ];
const nonProdEnvironments = environments.filter(v => !prodEnvironments.includes(v as any));

const ciEnvironments: ReadonlyArray<Environment> = [ 'ci', 'ci-beta' ];
const qaEnvironments: ReadonlyArray<Environment> = [ 'qa', 'qa-beta' ];
const stageEnvironments: ReadonlyArray<Environment> = [ 'stage', 'stage-beta', 'govStage', 'govStage-beta' ];

const govProdEnvironments: ReadonlyArray<Environment> = [ 'gov', 'gov-beta' ];
const govStageEnvironments: ReadonlyArray<Environment> = [ 'govStage', 'govStage-beta' ];

export type NonBetaEnvironment = typeof nonBetaEnvironments[number];
export type BetaEnvironment = typeof betaEnvironments[number];

export type Environment = NonBetaEnvironment | BetaEnvironment;

type Environments = Record<
    'all' | 'beta' | 'nonBeta' | 'prod' | 'nonProd' | 'ci' | 'qa' | 'stage' | 'govProd' | 'govStage',
    ReadonlyArray<Environment>
>;
export const Environments: Environments = {
    all: environments,
    beta: betaEnvironments,
    nonBeta: nonBetaEnvironments,
    prod: prodEnvironments,
    nonProd: nonProdEnvironments,
    ci: ciEnvironments,
    qa: qaEnvironments,
    stage: stageEnvironments,
    govProd: govProdEnvironments,
    govStage: govStageEnvironments
};

export const getChromeEnvironment = (chrome: ChromeAPI): Environment => {
    const isBeta = chrome.isBeta();
    const env: string = chrome.getEnvironment();
    if (isBeta) {
        return `${env}-beta`;
    } else {
        return env;
    }
};
