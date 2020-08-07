import * as React from 'react';
import { InsightsType } from '../../utils';

interface BetaDetectorContextType {
    isBeta?: boolean;
}

const BetaDetectorContext = React.createContext<BetaDetectorContextType>({});

interface RenderIfProps {
    renderIfBeta: boolean;
}

const RenderIf: React.FunctionComponent<RenderIfProps> = (props) => {
    const { isBeta } = React.useContext(BetaDetectorContext);
    if (isBeta === undefined) {
        throw new Error('Invalid usage of BetaIf*, must be surrounded by a BetaDetector');
    }

    if (props.renderIfBeta === isBeta) {
        return <>{ props.children }</>;
    }

    return <></>;
};

interface ChildrenRequiredProps {
    children: React.ReactNode;
}

export const BetaIf: React.FunctionComponent<ChildrenRequiredProps> = (props) => {
    return <RenderIf renderIfBeta={ true }>{ props.children }</RenderIf>;
};

export const BetaIfNot: React.FunctionComponent<ChildrenRequiredProps> = (props) => {
    return <RenderIf renderIfBeta={ false }>{ props.children }</RenderIf>;
};

type BetaIfOrBetaIfNotType = ReturnType<typeof BetaIf | typeof BetaIfNot>;

type BetaDetectorProps = {
    children: Array<BetaIfOrBetaIfNotType> | BetaIfOrBetaIfNotType;
    isBeta: boolean;
}

export const BetaDetector: React.FunctionComponent<BetaDetectorProps> = (props) => {

    const contextValue: BetaDetectorContextType = {
        isBeta: props.isBeta
    };

    let betaIfCount = 0;
    let betaIfNotCount = 0;
    React.Children.forEach(props.children, child => {
        if (child && (child as any).type) {
            const type = (child as any).type;
            if (type === BetaIf) {
                ++betaIfCount;
            } else if (type === BetaIfNot) {
                ++betaIfNotCount;
            } else {
                throw new Error('Only BetaIf and BetaIfNot are accepted Elements in BetaDetector');
            }
        }
    });

    if (betaIfCount > 1 || betaIfNotCount > 1) {
        throw new Error('Only one of each BetaIf and BetaIfNot is allowed on each BetaDetector');
    }

    return (
        <BetaDetectorContext.Provider value={ contextValue }>
            { props.children }
        </BetaDetectorContext.Provider>
    );
};

interface InsightsBetaDetectorProps extends Omit<BetaDetectorProps, 'isBeta'> {
    insights: InsightsType;
}

export const InsightsBetaDetector: React.FunctionComponent<InsightsBetaDetectorProps> = (props) => {
    return (
        <BetaDetector isBeta={ props.insights.chrome.isBeta() }>
            { props.children }
        </BetaDetector>
    );
};
