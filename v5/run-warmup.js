import {canHack, canWeaken, hasFunds, isAttackable} from 'server-utils.js';
import {runSingle} from 'thread-utils.js';

export async function main(ns) {	
	var server = ns.args[0] ?? 'n00dles';
	var weakenThreshold = ns.args[1] ?? 1.1;
	var hackThreshold = ns.args[2] ?? .8;
	
	await runSingle(ns, 'run-simple-status.js');
	await ns.sleep(1000);
	await warmupServer(ns, server, weakenThreshold, hackThreshold);
}

/** warmup a single server */
export async function warmupServer(ns, server, weakenThreshold, hackThreshold) {	
	// parse args
	var server = server ?? 'n00dles';
	var weakenThreshold = weakenThreshold ?? 1.1;
	var hackThreshold = hackThreshold ?? .8;

	// pause until hacking level is high enough
	var hackable = await canHack(ns, server);
	while (!hackable) {
		await ns.sleep(3000);
		hackable = await canHack(ns, server);
	}

	// weaken or hack or grow
	var attackable = await isAttackable(server);
	while (attackable) {
		// monitor
		var hasSecurity = await canWeaken(ns, weakenThreshold, server);
		if (hasSecurity) {
			ns.print('hasSecurity');
			await ns.weaken(server);
		} else {
			var hasMoney = await hasFunds(ns, hackThreshold, server);
			if (hasMoney) {
				ns.print('hasMoney');
				await ns.hack(server);
			} else {
				ns.print('grow');
				await ns.grow(server);
			}
		}
	}
}