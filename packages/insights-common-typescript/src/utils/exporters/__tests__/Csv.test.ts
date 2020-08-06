import * as csv from '@fast-csv/parse';

import { ExporterCsv, ExporterHeaders } from '../Csv';
import { ExporterType } from '../Type';

describe('src/utils/exporters/Csv', () => {

    const foo = {
        just: 'an',
        object: 'with some' as string | undefined,
        values: 'and keys',
        nested: {
            array: [ 'ba', 1, 2, 3 ],
            orOther: {
                objects: 'bye'
            }
        }
    };

    class FooExporterCsv extends ExporterCsv<typeof foo> {
        headers(): ExporterHeaders<FooExporterCsv, typeof foo> {
            return [
                [ 'just-2', 'Justice' ],
                [ 'object', 'Object,and,stuff' ],
                [ 'array', 'Array "data"' ]
            ];
        }

        serialize(element) {
            return {
                'just-2': element.just,
                object: element.object,
                array: element.nested.array.join(',')
            };
        }
    }

    it('Exports elements to csv string', () => {
        const exporter = new FooExporterCsv();
        const result = exporter.export([ foo, { ...foo, just: 'foo,baz', object: undefined }, { ...foo, just: '"bar,ok"' }]);

        const reader = new FileReader();
        return new Promise((done, fail) => {
            reader.addEventListener('loadend', () => {
                try {
                    let index = 0;
                    csv.parseString((reader.result as string), { headers: true })
                    .on('data', (row) => {
                        expect(Object.keys(row)).toEqual([
                            'Justice',
                            'Object,and,stuff',
                            'Array "data"'
                        ]);

                        switch (index) {
                            case 0:
                                expect(row).toEqual({
                                    Justice: 'an',
                                    'Object,and,stuff': 'with some',
                                    'Array "data"': 'ba,1,2,3'
                                });
                                break;
                            case 1:
                                expect(row).toEqual({
                                    Justice: 'foo,baz',
                                    'Object,and,stuff': '',
                                    'Array "data"': 'ba,1,2,3'
                                });
                                break;
                            case 2:
                                expect(row).toEqual({
                                    Justice: '"bar,ok"',
                                    'Object,and,stuff': 'with some',
                                    'Array "data"': 'ba,1,2,3'
                                });
                                break;
                            default:
                                fail(`Unexpected element at index ${index}: ${JSON.stringify(row)}`);
                        }

                        ++index;
                    })
                    .on('error', fail)
                    .on('end', (count) => {
                        expect(count).toBe(3);
                        done();
                    });
                } catch (ex) {
                    fail(ex);
                }
            });
            reader.readAsText(result);
        });
    });

    it('Children class is of type CSV', () => {
        const exporter = new FooExporterCsv();
        expect(exporter.type).toBe(ExporterType.CSV);
    });

    it('Blob result is text/csv', () => {
        const exporter = new FooExporterCsv();
        expect(exporter.export([ foo ]).type).toBe('text/csv');
    });
});
