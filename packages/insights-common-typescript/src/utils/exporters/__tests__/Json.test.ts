import { ExporterJson } from '../Json';
import { ExporterType } from '../Type';

describe('src/utils/exporters/Json', () => {

    const foo = {
        just: 'an',
        object: 'with some',
        values: 'and keys',
        nested: {
            array: [ 'ba', 1, 2, 3 ],
            orOther: {
                objects: 'bye'
            }
        }
    };

    class FooExporterJson extends ExporterJson<typeof foo> { }

    it('Exports elements to json string', () => {
        const exporter = new FooExporterJson();
        const result = exporter.export([ foo, foo, foo ]);
        const reader = new FileReader();
        return new Promise((done, fail) => {
            reader.addEventListener('loadend', () => {
                try {
                    const text = (reader.result as string);
                    expect(text).toEqual(JSON.stringify([ foo, foo, foo ]));
                    done();
                } catch (ex) {
                    fail(ex);
                }
            });
            reader.readAsText(result);
        });
    });

    it('Children class is of type JSON', () => {
        const exporter = new FooExporterJson();
        expect(exporter.type).toBe(ExporterType.JSON);
    });

    it('Blob result is application/json', () => {
        const exporter = new FooExporterJson();
        expect(exporter.export([ foo ]).type).toBe('application/json');
    });
});
