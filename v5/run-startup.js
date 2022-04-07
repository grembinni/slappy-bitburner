import {runSingle} from 'bit-utils.js';

export async function main(ns) {
	await runSingle(ns, 'run-status-all.js');
	await ns.sleep(500);
	await runSingle(ns, 'run-attack.js');
	await ns.sleep(500);
	await runSingle(ns, 'run-swarm.js');
	await ns.sleep(500);
	await runSingle(ns, 'run-hack-self.js');
}