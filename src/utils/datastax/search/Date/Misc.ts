import type { Buffer } from "node:buffer";
import Long from "long";

const writeDate = (date: Date, buffer: Buffer, offset: number): number => {
    const long = Long.fromNumber(date.getTime());
    buffer.writeUInt32BE(long.getHighBitsUnsigned(), offset);
    buffer.writeUInt32BE(long.getLowBitsUnsigned(), offset + 4);
    return offset + 8;
};


const readDate = (buffer: Buffer, offset: number) => {
    const long = new Long(buffer.readInt32BE(offset + 4), buffer.readInt32BE(offset));
    return new Date(long.toNumber());
};

export {
    writeDate,
    readDate
}
