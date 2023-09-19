/* eslint-disable prefer-named-capture-group */
import { Buffer } from "node:buffer";
import Long from "long";
import { monthsPerYear, nanosPerHour, nanosPerMicro, nanosPerMilli, nanosPerMinute, nanosPerSecond } from "../constants.js";
import VIntCoding from "./VIntCoding.js";
import { append, append64, parseIso8601AlternativeFormat, parseIso8601Format, parseIso8601WeekFormat, parseStandardFormat } from "./misc.js";


// Reuse the same buffers that should perform slightly better than built-in buffer pool
const reusableBuffers = {
    months: Buffer.alloc(9),
    days: Buffer.alloc(9),
    nanoseconds: Buffer.alloc(9)
};


class Duration {
    public months: number;
    
    public days: number;
    
    public nanoseconds: Long;
    
    public constructor(months: number, days: number, nanoseconds: Long | number) {
        this.months = months;
        this.days = days;
        this.nanoseconds = typeof nanoseconds === 'number' ? Long.fromNumber(nanoseconds) : nanoseconds;
    }

    public equals(other: Duration) {
        if (!(other instanceof Duration)) {
            return false;
        }

        return this.months === other.months &&
            this.days === other.days &&
            this.nanoseconds.equals(other.nanoseconds);
    };

    /**
     * Serializes the duration and returns the representation of the value in bytes.
     *
     * @returns {Buffer}
     */
    public toBuffer() {
        const lengthMonths = VIntCoding.writeVInt(Long.fromNumber(this.months), reusableBuffers.months);
        const lengthDays = VIntCoding.writeVInt(Long.fromNumber(this.days), reusableBuffers.days);
        const lengthNanoseconds = VIntCoding.writeVInt(this.nanoseconds, reusableBuffers.nanoseconds);
        const buffer = Buffer.alloc(lengthMonths + lengthDays + lengthNanoseconds);
        reusableBuffers.months.copy(buffer, 0, 0, lengthMonths);
        let offset = lengthMonths;
        reusableBuffers.days.copy(buffer, offset, 0, lengthDays);
        offset += lengthDays;
        reusableBuffers.nanoseconds.copy(buffer, offset, 0, lengthNanoseconds);
        return buffer;
    };

    /**
     * Returns the string representation of the value.
     *
     * @return {string}
     */
    public toString() {
        let value = '';
       
        if (this.months < 0 || this.days < 0 || this.nanoseconds.isNegative()) {
            value = '-';
        }

        const remainder = append(value, Math.abs(this.months), monthsPerYear, "y");
        const newVal = append(remainder.newValue, remainder.dividend, 1, "mo");
        const secondNewVal = append(newVal.newValue, Math.abs(this.days), 1, "d");

        value = secondNewVal.newValue;
        
        if (!this.nanoseconds.equals(Long.ZERO)) {
            const nanos = this.nanoseconds.isNegative() ? this.nanoseconds.negate() : this.nanoseconds;
            let newremainder = append64(value, nanos, nanosPerHour, "h");
            newremainder = append64(newremainder.newValue, newremainder.dividend, nanosPerMinute, "m");
            newremainder = append64(newremainder.newValue, newremainder.dividend, nanosPerSecond, "s");
            newremainder = append64(newremainder.newValue, newremainder.dividend, nanosPerMilli, "ms");
            newremainder = append64(newremainder.newValue, newremainder.dividend, nanosPerMicro, "us");
            
            const { newValue } = append64(newremainder.newValue, newremainder.dividend, Long.ONE, "ns");
            
            value = newValue;
        }

        return value;
    };

    public static fromBuffer(buffer: Buffer) {
        const offset = { value: 0 };
        const months = VIntCoding.readVInt(buffer, offset).toNumber();
        const days = VIntCoding.readVInt(buffer, offset).toNumber();
        const nanoseconds = VIntCoding.readVInt(buffer, offset);
        return new Duration(months, days, nanoseconds);
    };

    public static fromString(input: string) {
        const isNegative = input.startsWith('-');
        const source = isNegative ? input.slice(1) : input;
        if (source.startsWith('P')) {
            if (source.endsWith('W')) {
                return parseIso8601WeekFormat(isNegative, source);
            }

            if (source.indexOf('-') > 0) {
                return parseIso8601AlternativeFormat(isNegative, source);
            }

            return parseIso8601Format(isNegative, source);
        }

        return parseStandardFormat(isNegative, source);
    };
}



export {
    Duration
}
