import {runSingle} from 'bit-utils.js';

export async function main(ns) {
	await runSingle(ns, 'statusbot.js');
	await ns.sleep(500);
	await runSingle(ns, 'attackbot.js');
	await ns.sleep(500);
	await runSingle(ns, 'swarmbot.js');
	await ns.sleep(500);
	await runSingle(ns, 'hack-self.js');
	await ns.sleep(500);
	await runSingle(ns, 'netbot.js');
}