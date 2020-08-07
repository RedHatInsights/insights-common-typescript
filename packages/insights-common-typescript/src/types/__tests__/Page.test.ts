import { Direction, Filter, Operator, Page, Sort } from '../..';

describe('src/types/Page', () => {

    it('Default page size is 50', () => {
        const page = Page.defaultPage();
        expect(page.size).toEqual(50);
    });

    it('Default page index is 1', () => {
        const page = Page.defaultPage();
        expect(page.index).toEqual(1);
    });

    it('Default page sort is undefined', () => {
        const page = Page.defaultPage();
        expect(page.sort).toEqual(undefined);
    });

    it('Default page filter is undefined', () => {
        const page = Page.defaultPage();
        expect(page.filter).toEqual(undefined);
    });

    it('Page.of creates a Page', () => {
        const filter = new Filter().and('foo', Operator.ILIKE, 'bar');
        const sort = Sort.by('baz', Direction.DESCENDING);
        const page = Page.of(
            33,
            55,
            filter,
            sort
        );
        expect(page.index).toEqual(33);
        expect(page.size).toEqual(55);
        expect(page.filter).toEqual(filter);
        expect(page.sort).toEqual(sort);
    });

    it('Page.of without size is the same as the defaultPage.size', () => {
        const page = Page.of(90);
        expect(page.size).toEqual(Page.defaultPage().size);
    });

    it('hasFilter checks if we have any filter', () => {
        expect(Page.defaultPage().hasFilter()).toBeFalsy();
        expect(Page.of(
            1,
            1,
            new Filter().and('col', Operator.EQUAL, 'foo')
        ).hasFilter()).toBeTruthy();
    });

    it('withPage gives a new Page with the given index', () => {
        expect(Page.of(1, 100).withPage(9).index).toEqual(9);
        expect(Page.of(1, 1).withPage(13).index).toEqual(13);
    });

    it('nextPage gives a new Page with the next index', () => {
        expect(Page.of(2, 100).nextPage().index).toEqual(3);
        expect(Page.of(4, 1).nextPage().index).toEqual(5);
        expect(Page.of(9, 10).nextPage().index).toEqual(10);
        expect(Page.of(15, 1337).nextPage().index).toEqual(16);
    });

    it('withSort gives a new Page with the given sort', () => {
        expect(
            Page.of(1, 100, undefined, Sort.by('foo', Direction.DESCENDING))
            .withSort(undefined).sort
        ).toEqual(undefined);

        expect(
            Page.of(1, 100, undefined, Sort.by('foo', Direction.DESCENDING))
            .withSort(Sort.by('bar', Direction.ASCENDING)).sort
        ).toEqual(Sort.by('bar', Direction.ASCENDING));

        expect(
            Page.of(1, 100)
            .withSort(Sort.by('baz', Direction.DESCENDING)).sort
        ).toEqual(Sort.by('baz', Direction.DESCENDING));
    });

    describe('start', () => {
        it('Gives the 0 on first page', () => {
            expect(Page.of(1, 100).start()).toEqual(0);
            expect(Page.of(1, 1).start()).toEqual(0);
            expect(Page.of(1, 10).start()).toEqual(0);
            expect(Page.of(1, 1337).start()).toEqual(0);
        });

        it('Gives the offset of elements', () => {
            expect(Page.of(2, 100).start()).toEqual(100);
            expect(Page.of(4, 1).start()).toEqual(3);
            expect(Page.of(3, 10).start()).toEqual(20);
            expect(Page.of(2, 1337).start()).toEqual(1337);
        });
    });

    describe('end', () => {
        it('Gives the size on first page', () => {
            expect(Page.of(1, 100).end()).toEqual(100);
            expect(Page.of(1, 1).end()).toEqual(1);
            expect(Page.of(1, 10).end()).toEqual(10);
            expect(Page.of(1, 1337).end()).toEqual(1337);
        });

        it('Gives the end offset of elements', () => {
            expect(Page.of(2, 100).end()).toEqual(200);
            expect(Page.of(4, 1).end()).toEqual(4);
            expect(Page.of(3, 10).end()).toEqual(30);
            expect(Page.of(2, 1337).end()).toEqual(2674);
        });
    });

    describe('lastPageForElements', () => {
        it('last page is 1 for 0 elements', () => {
            expect(Page.lastPageForElements(0, 10).index).toEqual(1);
        });

        it('last page is 1 for 10 elements and 10 per page', () => {
            expect(Page.lastPageForElements(10, 10).index).toEqual(1);
        });

        it('last page is 2 for 11 elements and 10 per page', () => {
            expect(Page.lastPageForElements(11, 10).index).toEqual(2);
        });

        it('last page is 2 for 15 elements and 10 per page', () => {
            expect(Page.lastPageForElements(15, 10).index).toEqual(2);
        });

        it('last page is 1 for 15 elements and 20 per page', () => {
            expect(Page.lastPageForElements(15, 20).index).toEqual(1);
        });
    });

});
