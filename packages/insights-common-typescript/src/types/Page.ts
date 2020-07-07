import { DeepReadonly } from 'ts-essentials';

const DEFAULT_PAGE_SIZE = 50;

export class Page {

    public static readonly NO_SIZE = -1;

    readonly index: number;
    readonly size: number;
    readonly filter?: Filter;
    readonly sort?: Sort;

    private constructor(index: number, size?: number, filter?: Filter, sort?: Sort) {
        this.index = index;
        this.size = size || DEFAULT_PAGE_SIZE;
        this.filter = filter;
        this.sort = sort;
    }

    public hasFilter() {
        return this.filter !== undefined  && this.filter.elements.length > 0;
    }

    public start() {
        return (this.index - 1) * this.size;
    }

    public end() {
        return this.index * this.size;
    }

    public withPage(index: number) {
        return Page.of(index, this.size, this.filter, this.sort);
    }

    public nextPage() {
        return Page.of(this.index + 1, this.size, this.filter, this.sort);
    }

    public withSort(sort: Sort | undefined) {
        return Page.of(this.index, this.size, this.filter, sort);
    }

    static of(index: number, size?: number, filter?: Filter, sort?: Sort) {
        return new Page(index, size, filter, sort);
    }

    static defaultPage() {
        return new Page(1, DEFAULT_PAGE_SIZE);
    }

    static lastPageForElements(count: number, size: number) {
        return new Page(Math.max(Math.trunc((count + size - 1) / size), 1), size);
    }

}

class FilterElement {
    readonly column: string;
    readonly operator: Operator;
    readonly value: string;

    public constructor(column: string, operator: Operator, value: string) {
        this.column = column;
        this.operator = operator;
        this.value = value;
    }
}

export class Filter {
    private _elements: FilterElement[];
    readonly elements: DeepReadonly<FilterElement[]>;

    public constructor() {
        this.elements = this._elements = [];
    }

    public and(column: string, operator: Operator, value: string) {
        this._elements.push(new FilterElement(column, operator, value));
        return this;
    }

}

export class Sort {
    readonly column: string;
    readonly direction: Direction;

    private constructor(column: string, direction: Direction) {
        this.column = column;
        this.direction = direction;
    }

    static by(column: string, direction: Direction) {
        return new Sort(column, direction);
    }
}

export enum Direction {
    ASCENDING = 'ASC',
    DESCENDING = 'DESC'
}

export enum Operator {
    EQUAL = 'EQUAL',
    LIKE = 'LIKE',
    ILIKE = 'ILIKE',
    NOT_EQUAL = 'NOT_EQUAL',
    BOOLEAN_IS = 'BOOLEAN_IS'
}

export type OnSortHandlerType = (index: number, column: string, direction: Direction) => void;
