import { getProgram } from '../../src/cli/Program';
import { ActionGeneratorType } from '../../src/core/types/ActionGeneratorType';

describe('src/Program', () => {
    it('getProgram default values', () => {
        expect(getProgram()).toMatchObject({
            skipPostProcess: false,
            actionGenerator: ActionGeneratorType.NONE,
            addEslintDisable: false,
            skipTypes: false
        });
    });
});
