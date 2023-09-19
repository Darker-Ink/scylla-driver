import { DateRangePrecision, dateRegex } from "../../../constants.js";
import BoundaryBuilder from "./BoundaryBuilder.js";

class DateRangeBound {
    public date: Date | null;

    public precision: DateRangePrecision;

    public constructor(date: Date | null, precision: DateRangePrecision) {
        this.date = date;

        this.precision = precision;
    }

    public toString() {
        if (this.precision === -1) {
            return '*';
        }

        if (!this.date) {
            throw new TypeError('Date is null');
        }
        
        let precision = 0;
        const isoString = this.date.toISOString();
        let char;
        let int = 0;
        
        // The years take at least the first 4 characters
        for (int = 4; int < isoString.length && precision <= this.precision; int++) {
            char = isoString.charAt(int);

            if (precision === DateRangePrecision.day && char === 'T') {
                precision = DateRangePrecision.hour;
                continue;
            }

            if (precision >= DateRangePrecision.hour && char === ':' || char === '.') {
                precision++;
                continue;
            }

            if (precision < DateRangePrecision.day && char === '-') {
                precision++;
            }
        }

        let start = 0;
        const firstChar = isoString.charAt(0);
        let sign = '';
        let toRemoveIndex = 4;

        if (firstChar === '+' || firstChar === '-') {
            sign = firstChar;

            if (firstChar === '-') {
                // since we are retaining the -, don't remove as many zeros.
                toRemoveIndex = 3;
            }

            // Remove additional zeros
            for (start = 1; start < toRemoveIndex; start++) {
                if (isoString.charAt(start) !== '0') {
                    break;
                }
            }
        }

        if (this.precision !== DateRangePrecision.millisecond) {
            // i holds the position of the first char that marks the end of a precision (ie: '-', 'T', ...),
            // we should not include it in the result, except its the 'Z' char for the complete representation
            int--;
        }

        return sign + isoString.slice(start, int);
    }

    public equals(other: DateRangeBound | null) {
        if (!other) {
            return false;
        }

        if (!(other instanceof DateRangeBound)) {
            return false;
        }

        if (other.precision !== this.precision) {
            return false;
        }
        
        return DateRangeBound.datesEqual(other.date, this.date);
    }
    
    public static datesEqual(d1: Date | null, d2: Date | null) {
        const t1 = d1 ? d1.getTime() : null;
        const t2 = d2 ? d2.getTime() : null;
        
        return t1 === t2;
    }

    public isUnbounded() {
        return (this.precision === -1);
    }

    public static fromString(boundaryString: string) {
        if (!boundaryString) {
            return new DateRangeBound(null, -1);
        }

        if (boundaryString === '*') {
            return new DateRangeBound(new Date(), -1);
        }

        const matches = dateRegex.exec(boundaryString);
        if (!matches) {
            throw new TypeError('String provided is not a valid date ' + boundaryString);
        }

        if (matches[7] !== undefined && matches[5] === undefined) {
            // Due to a limitation in the regex, its possible to match dates like 2015T03:02.001, without the seconds
            // portion but with the milliseconds specified.
            throw new TypeError('String representation of the date contains the milliseconds portion but not the seconds: ' +
                boundaryString);
        }

        const builder = new BoundaryBuilder(boundaryString.startsWith('-'));
        
        for (let int = 1; int < matches.length; int++) {
            builder.set(int - 1, matches?.[int] ?? "", boundaryString);
        }

        return builder.build();
    }
    
    public static toLowerBound(bound: DateRangeBound) {
        if (bound === new DateRangeBound(null, -1)) {
            return bound;
        }
        
        if (!bound.date) {
            throw new TypeError('Date is null');
        }

        const rounded = new Date(bound.date.getTime());
        // in this case we want to fallthrough
        /* eslint-disable no-fallthrough */
        switch (bound.precision) {
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.year: {
                rounded.setUTCMonth(0);
            }

            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.month: {
                rounded.setUTCDate(1);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.day: {
                rounded.setUTCHours(0);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.hour: {
                rounded.setUTCMinutes(0);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.minute: {
                rounded.setUTCSeconds(0);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.second: {
                rounded.setUTCMilliseconds(0);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.millisecond: {}
            case DateRangePrecision.unbounded: {}
        }

        return new DateRangeBound(rounded, bound.precision);
    }
    
    public static toUpperBound(bound: DateRangeBound) {
        if (bound === new DateRangeBound(null, -1)) {
            return bound;
        }
        
        if (!bound.date) {
            throw new TypeError('Date is null');
        }

        const rounded = new Date(bound.date.getTime());
        // in this case we want to fallthrough
        /* eslint-disable no-fallthrough */
        switch (bound.precision) {
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.year: {
                rounded.setUTCMonth(11);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.month: {
                // Advance to the beginning of next month and set day of month to 0
                // which sets the date to the last day of the previous month.
                // This gives us the effect of YYYY-MM-LastDayOfThatMonth
                rounded.setUTCMonth(rounded.getUTCMonth() + 1, 0);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.day: {
                rounded.setUTCHours(23);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.hour: {
                rounded.setUTCMinutes(59);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.minute: {
                rounded.setUTCSeconds(59);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.second: {
                rounded.setUTCMilliseconds(999);
            }
            
            // @ts-expect-error -- We want to fallthrough
            case DateRangePrecision.millisecond: {}
            case DateRangePrecision.unbounded: {}
        }

        /* eslint-enable no-fallthrough */
        return new DateRangeBound(rounded, bound.precision);
    }
}

export default DateRangeBound;

export {
    DateRangeBound
}
