/* eslint-disable prefer-named-capture-group */
import { Buffer } from 'node:buffer';
import { dateRangeType, multipleBoundariesRegex } from '../../../constants.js';
import DateRangeBound from './DateRangeBound.js';
import { readDate, writeDate } from './Misc.js';

const unbounded = new DateRangeBound(null, -1);

class DateRange {
    public lowerBound: DateRangeBound;

    public upperBound: DateRangeBound | null;

    public type: dateRangeType;

    public constructor(lowerBound: DateRangeBound, upperBound?: DateRangeBound | null) {
        this.lowerBound = lowerBound;

        this.upperBound = upperBound ?? null;

        if (!this.upperBound) {
            if (this.lowerBound === unbounded) {
                this.type = dateRangeType.openSingle;
            } else {
                this.type = dateRangeType.singleValue;
            }
        } else if (this.lowerBound === unbounded) {
            if (this.upperBound === unbounded) {
                this.type = dateRangeType.openBoth;
            } else {
                this.type = dateRangeType.openRangeLow;
            }
        } else if (this.upperBound === unbounded) {
            this.type = dateRangeType.openRangeHigh;
        } else {
            this.type = dateRangeType.closedRange;
        }
    }

    public equals(other: DateRange) {
        if (!(other instanceof DateRange)) {
            return false;
        }

        return (other.lowerBound.equals(this.lowerBound) &&
            (other.upperBound ? other.upperBound.equals(this.upperBound) : !this.upperBound));
    }

    public toString() {
        if (this.upperBound === null) {
            return this.lowerBound.toString();
        }

        return `[${this.lowerBound.toString()} TO ${this.upperBound.toString()}]`;
    }

    public toBuffer() {
        // Serializes the value containing:
        if (this.type === dateRangeType.openBoth || this.type === dateRangeType.openSingle) {
            return Buffer.from([this.type]);
        }

        let buffer;
        let offset = 0;

        if (this.type !== dateRangeType.closedRange) {
            // byte + long + byte
            const boundary = this.type === dateRangeType.openRangeLow ? this.upperBound : this.lowerBound;

            if (!boundary?.date) {
                throw new TypeError('DateRange serialized value must have a date');
            }
            
            buffer = Buffer.alloc(10);
            buffer.writeUInt8(this.type, offset++);
            offset = writeDate(boundary.date, buffer, offset);
            buffer.writeUInt8(boundary.precision, offset);

            return buffer;
        }
        
        if (!this.upperBound?.date || !this.lowerBound?.date) {
            throw new TypeError('DateRange serialized value must have a date');
        }

        // byte + long + byte + long + byte
        buffer = Buffer.alloc(19);
        buffer.writeUInt8(this.type, offset++);
        offset = writeDate(this.lowerBound.date, buffer, offset);
        buffer.writeUInt8(this.lowerBound.precision, offset++);
        offset = writeDate(this.upperBound.date, buffer, offset);
        buffer.writeUInt8(this.upperBound.precision, offset);

        return buffer;
    }

    public static fromString(dateRangeString: string) {
        const matches = multipleBoundariesRegex.exec(dateRangeString);

        if (!matches) {
            return new DateRange(DateRangeBound.toLowerBound(DateRangeBound.fromString(dateRangeString)));
        }

        return new DateRange(DateRangeBound.toLowerBound(DateRangeBound.fromString(matches?.[1] ?? "")), DateRangeBound.toUpperBound(DateRangeBound.fromString(matches?.[2] ?? "")));
    }

    public static fromBuffer(buffer: Buffer) {
        if (buffer.length === 0) {
            throw new TypeError('DateRange serialized value must have at least 1 byte');
        }

        const type = buffer.readUInt8(0);
        if (type === dateRangeType.openBoth) {
            return new DateRange(unbounded, unbounded);
        }

        if (type === dateRangeType.openSingle) {
            return new DateRange(unbounded);
        }

        let offset = 1;
        let date1;
        let lowerBound;
        let upperBound = null;
        if (type !== dateRangeType.closedRange) {
            date1 = readDate(buffer, offset);
            offset += 8;
            lowerBound = new DateRangeBound(date1, buffer.readUInt8(offset));
            if (type === dateRangeType.openRangeLow) {
                // lower boundary is open, the first serialized boundary is the upperBound
                upperBound = lowerBound;
                lowerBound = unbounded;
            }
            else {
                upperBound = type === dateRangeType.openRangeHigh ? unbounded : null;
            }

            return new DateRange(lowerBound, upperBound);
        }

        date1 = readDate(buffer, offset);
        offset += 8;
        lowerBound = new DateRangeBound(date1, buffer.readUInt8(offset++));
        
        const date2 = readDate(buffer, offset);
        
        offset += 8;
        upperBound = new DateRangeBound(date2, buffer.readUInt8(offset));
        
        return new DateRange(lowerBound, upperBound);
    }
}

export default DateRange;

export {
    DateRange
}
