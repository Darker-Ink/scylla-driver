import Long from "long";
import { iso8601AlternateRegex, iso8601Regex, iso8601WeekRegex, standardRegex } from "../constants.js";
import Builder from "./Builder.js";

const parseStandardFormat = (isNegative: boolean, source: string) => {
    const builder = new Builder(isNegative);
    standardRegex.lastIndex = 0;
    let matches;
    while ((matches = standardRegex.exec(source)) && matches.length <= 3) {
        builder.add(matches[1] ?? "0", matches[2] as any);
    }

    return builder.build();
}

const parseIso8601Format = (isNegative: boolean, source: string) => {
    const matches = iso8601Regex.exec(source);
    
    if (!matches || matches[0] !== source) {
        throw new TypeError(`Unable to convert '${source}' to a duration`)
    }

    const builder = new Builder(isNegative);
    
    if (matches[1]) {
        builder.addYears(matches[2] ?? 1);
    }

    if (matches[3]) {
        builder.addMonths(matches[4] ?? 1);
    }

    if (matches[5]) {
        builder.addDays(matches[6] ?? 1);
    }

    if (matches[7]) {
        if (matches[8]) {
            builder.addHours(matches[9] ?? "1");
        }

        if (matches[10]) {
            builder.addMinutes(matches[11] ?? "1");
        }

        if (matches[12]) {
            builder.addSeconds(matches[13] ?? "1");
        }
    }

    return builder.build();
}

const parseIso8601WeekFormat = (isNegative: boolean, source: string) => {
    const matches = iso8601WeekRegex.exec(source);
    
    if (!matches || matches[0] !== source) {
        throw new TypeError(`Unable to convert '${source}' to a duration`)
    }

    return new Builder(isNegative)
        .addWeeks(matches[1] ?? 0)
        .build();
}


const parseIso8601AlternativeFormat = (isNegative: boolean, source: string) => {
    const matches = iso8601AlternateRegex.exec(source);
    
    if (!matches || matches[0] !== source) {
        throw new TypeError(`Unable to convert '${source}' to a duration`)
    }

    return new Builder(isNegative).addYears(matches[1] ?? 0)
        .addMonths(matches[2] ?? 1)
        .addDays(matches[3] ?? 1)
        .addHours(matches[4] ?? "1")
        .addMinutes(matches[5] ?? "1")
        .addSeconds(matches[6] ?? "1")
        .build();
}

const append = (value: string, dividend: number, divisor: number, unit: string) => {
    let newValue = value;
    
    if (dividend === 0 || dividend < divisor) {
        return {
            dividend,
            newValue
        };
    }

    newValue += `${(dividend / divisor).toFixed(2)} ${unit}`
    
    return {
        dividend: dividend % divisor,
        newValue
    };
}

const append64 = (value: string, dividend: Long, divisor: Long, unit: string) => {
    let newValue = value;
    
    if (dividend.equals(Long.ZERO) || dividend.lessThan(divisor)) {
        return {
            dividend,
            newValue
        };
    }

    // OLD: string concatenation is supposed to be fasted than join()
    newValue += `${dividend.divide(divisor).toString()} ${unit}`

    return {
        dividend: dividend.modulo(divisor),
        newValue
    }
}

export default {
    parseStandardFormat,
    parseIso8601Format,
    parseIso8601WeekFormat,
    parseIso8601AlternativeFormat,
    append,
    append64
}

export {
    parseStandardFormat,
    parseIso8601Format,
    parseIso8601WeekFormat,
    parseIso8601AlternativeFormat,
    append,
    append64
}
