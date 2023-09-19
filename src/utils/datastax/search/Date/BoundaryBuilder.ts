import { DateRangePrecision } from "../../../constants.js";
import DateRangeBound from "./DateRangeBound.js";

class BoundaryBuilder {
    public sign: number;
    
    public index: number;
    
    public values: Int32Array;
    
    public constructor(isNegative: boolean) {
        this.sign = isNegative ? -1 : 1;
        this.index = 0;
        this.values = new Int32Array(7);
    }
    
    public set(index: number, value: string, stringDate: string) {
        if (value === undefined) {
            return;
        }

        if (index > 6) {
            throw new TypeError(`Index out of bounds: ${index}`);
        }

        if (index > this.index) {
            this.index = index;
        }

        const numValue = Number(value);
        switch (index) {
            case DateRangePrecision.month: {
                if (numValue < 1 || numValue > 12) {
                    throw new TypeError('Month portion is not valid for date: ' + stringDate);
                }

                break;
            }
            
            case DateRangePrecision.day: {
                if (numValue < 1 || numValue > 31) {
                    throw new TypeError('Day portion is not valid for date: ' + stringDate);
                }

                break;
            }
            
            case DateRangePrecision.hour: {
                if (numValue > 23) {
                    throw new TypeError('Hour portion is not valid for date: ' + stringDate);
                }

                break;
            }
            
            case DateRangePrecision.minute:
            case DateRangePrecision.second: {
                if (numValue > 59) {
                    throw new TypeError('Minute/second portion is not valid for date: ' + stringDate);
                }

                break;
            }
            
            case DateRangePrecision.millisecond: {
                if (numValue > 999) {
                    throw new TypeError('Millisecond portion is not valid for date: ' + stringDate);
                }

                break;
            }
        }

        this.values[index] = numValue;
    }
    
    public build() {
        const date = new Date(0);
        let month = this.values[1];
        
        if (month) {
            // ES Date months are represented from 0 to 11
            month--;
        }

        date.setUTCFullYear(this.sign * (this.values?.[0] ?? 0), month, this.values[2] ?? 1);
        date.setUTCHours(this.values?.[3] ?? 0, this.values[4], this.values[5], this.values[6]);
        
        return new DateRangeBound(date, this.index);
    }
}

export default BoundaryBuilder;

export {
    BoundaryBuilder
};
