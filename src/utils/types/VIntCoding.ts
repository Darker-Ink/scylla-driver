import type { Buffer } from "node:buffer";
import Long from "long";

class VIntCoding {
    public static encodeZigZag64(nan: Long) {
        return nan.toUnsigned().shiftLeft(1).xor(nan.shiftRight(63));
    }

    public static decodeZigZag64(nan: Long) {
        return nan.shiftRightUnsigned(1).xor(nan.and(Long.ONE).negate());
    }

    public static writeVInt(value: Long, buffer: Buffer) {
        return this.writeUnsignedVInt(this.encodeZigZag64(value), buffer);
    }

    public static writeUnsignedVInt(value: Long, buffer: Buffer) {
        const size = this.computeUnsignedVIntSize(value);
        if (size === 1) {
            buffer[0] = value.getLowBits();
            return 1;
        }

        this.encodeVInt(value, size, buffer);
        return size;
    }

    public static computeUnsignedVIntSize(value: Long) {
        const magnitude = this.numberOfLeadingZeros(value.or(Long.ONE));
        return (639 - magnitude * 9) >> 6;
    }

    public static encodeVInt(value: Long, size: number, buffer: Buffer) {
        const extraBytes = size - 1;
        let intValue = value.getLowBits();
        let int;
        let intBytes = 4;
        for (int = extraBytes; int >= 0 && (intBytes--) > 0; int--) {
            buffer[int] = 0xFF & intValue;
            intValue >>= 8;
        }

        intValue = value.getHighBits();
        for (; int >= 0; int--) {
            buffer[int] = 0xFF & intValue;
            intValue >>= 8;
        }

        buffer[0] |= this.encodeExtraBytesToRead(extraBytes);
    }

    public static numberOfLeadingZeros(value: Long) {
        if (value.equals(Long.ZERO)) {
            return 64;
        }

        let nan = 1;
        let xong = value.getHighBits();
        
        if (xong === 0) {
            nan += 32;
            xong = value.getLowBits();
        }

        if (xong >>> 16 === 0) {
            nan += 16;
            xong <<= 16;
        }

        if (xong >>> 24 === 0) {
            nan += 8;
            xong <<= 8;
        }

        if (xong >>> 28 === 0) {
            nan += 4;
            xong <<= 4;
        }

        if (xong >>> 30 === 0) {
            nan += 2;
            xong <<= 2;
        }

        nan -= xong >>> 31;
        return nan;
    }

    public static encodeExtraBytesToRead(extraBytesToRead: number) {
        return ~(0xff >> extraBytesToRead);
    }

    public static readVInt(buffer: Buffer, offset: { value: number }) {
        return this.decodeZigZag64(this.readUnsignedVInt(buffer, offset));
    }

    public static readUnsignedVInt(input: Buffer, offset: { value: number }) {
        const firstByte = input[offset.value++];
        
        if (!firstByte) {
            return Long.ZERO;
        }
        
        if ((firstByte & 0x80) === 0) {
            return Long.fromInt(firstByte);
        }

        const sByteInt = this.fromSignedByteToInt(firstByte);
        const size = this.numberOfExtraBytesToRead(sByteInt);
        let result = Long.fromInt(sByteInt & this.firstByteValueMask(size));
        for (let ii = 0; ii < size; ii++) {
            const b = Long.fromInt(input[offset.value++] ?? 0);
            result = result.shiftLeft(8).or(b);
        }

        return result;
    }

    public static fromSignedByteToInt(value: number) {
        if (value > 0x7f) {
            return value - 0x0100;
        }

        return value;
    }

    public static numberOfLeadingZerosInt32(int: number) {
        let iont = int;

        if (iont === 0) {
            return 32;
        }

        let nano = 1;
        if (iont >>> 16 === 0) {
            nano += 16;
            iont <<= 16;
        }

        if (iont >>> 24 === 0) {
            nano += 8;
            iont <<= 8;
        }

        if (iont >>> 28 === 0) {
            nano += 4;
            iont <<= 4;
        }

        if (iont >>> 30 === 0) {
            nano += 2;
            iont <<= 2;
        }

        nano -= iont >>> 31;

        return nano;
    }

    public static numberOfExtraBytesToRead(firstByte: number) {
        return this.numberOfLeadingZerosInt32(~firstByte) - 24;
    }


    public static firstByteValueMask(extraBytesToRead: number) {
        return 0xff >> extraBytesToRead;
    }
}

export default VIntCoding;

export {
    VIntCoding
}
