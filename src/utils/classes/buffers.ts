import { Buffer } from "node:buffer";
import { buffers } from "../constants.js";

class BufferLengths {
    public static getLengthV2(value: any) {
        if (!value) {
            return buffers.int32Zero;
        }

        // note: so in the cassandra driver they do unsafe, I'm not sure why though for now i'm doing it the safe way
        // if in the feature we run into an issue of needing to do it unsafe we can
        const lengthBuffer = Buffer.alloc(4);

        if (typeof value === 'number') {
            lengthBuffer.writeInt32BE(value, 0);
        } else {
            if (typeof value.length === 'undefined') {
                throw new TypeError('Couldn\'t get length on value');
            }

            lengthBuffer.writeInt32BE(value.length, 0);
        }

        return lengthBuffer;
    }

    public static getLengthV3(value: any) {
        if (!value) {
            return buffers.int32Zero;
        }

        const lengthBuffer = Buffer.alloc(4);

        if (typeof value === 'number') {
            lengthBuffer.writeInt32BE(value, 0);
        } else {
            lengthBuffer.writeInt32BE(value.length, 0);
        }

        return lengthBuffer;

    }
}

export {
    BufferLengths
}
