import Long from "long";
import { daysPerWeek, maxInt32, monthsPerYear, nanosPerHour, nanosPerMicro, nanosPerMilli, nanosPerMinute, nanosPerSecond } from "../constants.js";
import { Duration } from "./Duration.js";

class Builder {
    public isNegative: boolean;

    public unitIndex: number;

    public months: number;

    public days: number;

    public nanoseconds: any;

    public unitByIndex: (string | null)[];

    public constructor(isNegative: boolean) {
        this.isNegative = isNegative;

        this.unitIndex = 0;

        this.months = 0;

        this.days = 0;

        this.nanoseconds = Long.ZERO;

        this.unitByIndex = [
            null, 'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds', 'microseconds',
            'nanoseconds'
        ];
    }

    public validateOrder(unitIndex: number) {
        if (unitIndex === this.unitIndex) {
            throw new TypeError(`Invalid duration. The ${this._getUnitName(unitIndex)} are specified multiple times`);
        }

        if (unitIndex <= this.unitIndex) {
            throw new TypeError(`Invalid duration. The ${this._getUnitName(this.unitIndex)} should be after ${this._getUnitName(unitIndex)}`);
        }

        this.unitIndex = unitIndex;
    };

    public validateMonths(units: number, monthsPerUnit: number) {
        this.validate32(units, (maxInt32 - this.months) / monthsPerUnit, "months");
    };

    public validateDays(units: number, daysPerUnit: number) {
        this.validate32(units, (maxInt32 - this.days) / daysPerUnit, "days");
    };

    public _validateNanos(units: Long, nanosPerUnit: Long) {
        this.validate64(units, Long.MAX_VALUE.subtract(this.nanoseconds).divide(nanosPerUnit), "nanoseconds");
    };

    public validate32(units: number, limit: number, unitName: string) {
        if (units > limit) {
            // throw new TypeError(util.format('Invalid duration. The total number of %s must be less or equal to %s',
            //     unitName,
            //     maxInt32));
            
            throw new TypeError(`Invalid duration. The total number of ${unitName} must be less or equal to ${maxInt32}`);
        }
    };

    public validate64(units: Long, limit: Long, unitName: string) {
        if (units.greaterThan(limit)) {
            // throw new TypeError(util.format('Invalid duration. The total number of %s must be less or equal to %s',
            //     unitName,
            //     Long.MAX_VALUE.toString()));
            throw new TypeError(`Invalid duration. The total number of ${unitName} must be less or equal to ${Long.MAX_VALUE.toString()}`);
        }
    };

    public _getUnitName(unitIndex: number) {
        const name = this.unitByIndex[Number(unitIndex)];

        if (!name) {
            throw new Error(`Invalid unit index ${unitIndex}`);
        }

        return name;
    };

    public add(textValue: string, type: '\u00B5s' | 'd' | 'h' | 'm' | 'mo' | 'ms' | 'ns' | 's' | 'us' | 'w' | 'y') {
        switch (type) {
            case 'y': {
                return this.addYears(textValue);
            }

            case 'mo': {
                return this.addMonths(textValue);
            }

            case 'w': {
                return this.addWeeks(textValue);
            }

            case 'd': {
                return this.addDays(textValue);
            }

            case 'h': {
                return this.addHours(textValue);
            }

            case 'm': {
                return this.addMinutes(textValue);
            }

            case 's': {
                return this.addSeconds(textValue);
            }

            case 'ms': {
                return this.addMillis(textValue);
            }

            case 'us': {
                return this.addMicros(textValue);
            }

            case '\u00B5s': {
                return this.addMicros(textValue);
            }

            case 'ns': {
                return this.addNanos(textValue);
            }

            default: {
                throw new TypeError(`Invalid duration unit ${type}`);
            }
        }
    };

    public addYears(years: number | string) {
        const value = Number(years);
        this.validateOrder(1);
        this.validateMonths(value, monthsPerYear);
        this.months += value * monthsPerYear;
        return this;
    };

    public addMonths(months: number | string) {
        const value = Number(months);
        this.validateOrder(2);
        this.validateMonths(value, 1);
        this.months += value;
        return this;
    };

    public addWeeks(weeks: number | string) {
        const value = Number(weeks);
        this.validateOrder(3);
        this.validateDays(value, daysPerWeek);
        this.days += value * daysPerWeek;
        return this;
    };

    public addDays(days: number | string) {
        const value = Number(days);
        this.validateOrder(4);
        this.validateDays(value, 1);
        this.days += value;
        return this;
    };

    public addHours(hours: Long | string) {
        const value = typeof hours === 'string' ? Long.fromString(hours) : hours;
        this.validateOrder(5);
        this._validateNanos(value, nanosPerHour);
        this.nanoseconds = this.nanoseconds.add(value.multiply(nanosPerHour));
        return this;
    };

    public addMinutes(minutes: Long | string) {
        const value = typeof minutes === 'string' ? Long.fromString(minutes) : minutes;
        this.validateOrder(6);
        this._validateNanos(value, nanosPerMinute);
        this.nanoseconds = this.nanoseconds.add(value.multiply(nanosPerMinute));
        return this;
    };

    public addSeconds(seconds: Long | string) {
        const value = typeof seconds === 'string' ? Long.fromString(seconds) : seconds;
        this.validateOrder(7);
        this._validateNanos(value, nanosPerSecond);
        this.nanoseconds = this.nanoseconds.add(value.multiply(nanosPerSecond));
        return this;
    };

    public addMillis(millis: Long | string) {
        const value = typeof millis === 'string' ? Long.fromString(millis) : millis;
        this.validateOrder(8);
        this._validateNanos(value, nanosPerMilli);
        this.nanoseconds = this.nanoseconds.add(value.multiply(nanosPerMilli));
        return this;
    };

    public addMicros(micros: Long | string) {
        const value = typeof micros === 'string' ? Long.fromString(micros) : micros;
        this.validateOrder(9);
        this._validateNanos(value, nanosPerMicro);
        this.nanoseconds = this.nanoseconds.add(value.multiply(nanosPerMicro));
        return this;
    };

    public addNanos(nanos: Long | string) {
        const value = typeof nanos === 'string' ? Long.fromString(nanos) : nanos;
        this.validateOrder(10);
        this._validateNanos(value, Long.ONE);
        this.nanoseconds = this.nanoseconds.add(value);
        return this;
    };

    public build() {
        if (this.isNegative) {
            return new Duration(-this.months, -this.days, this.nanoseconds.negate());
        }
        
        return new Duration(this.months, this.days, this.nanoseconds);
    };
}

export default Builder;

export {
    Builder
};
