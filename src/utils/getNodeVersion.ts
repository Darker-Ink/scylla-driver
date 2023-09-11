import { version } from 'node:process';

const LowestAllowed = 14;

export default () => {
    const numVersion = Number.parseInt(version.replace('v', ''), 10);
    
    if (numVersion < LowestAllowed) {
        throw new Error(`Sorry, Your Nodejs version is too low, The lowest we support is v${LowestAllowed} Though you are running ${version}`)
    }
}
