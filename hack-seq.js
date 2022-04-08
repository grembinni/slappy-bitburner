import {isAttackable} from 'attack-utils.js';
import {canHack, canWeaken, hasFunds} from 'server-utils.js';
/**
 * Script that executes all 3 hack steps in a single executable. 
 * This is a selfcontained attack that is useful for simple low mem/self attack configuration.
 */
export async function main(ns) {	
	var server = ns.args[0];
	var weakenThreshold = ns.args[1] ?? 1.1;
	var hackThreshold = ns.args[2] ?? .8;

	if (isAttackable(server)) {
		await startHackSequence(ns, server, weakenThreshold, hackThreshold);
	}
}

/** execute all 3 hack steps */
async function startHackSequence(ns, server, weakenThreshold, hackThreshold) {	
	// parse args
	var server = server;
	var weakenThreshold = weakenThreshold ?? 1.1;
	var hackThreshold = hackThreshold ?? .8;

	// pause until hacking level is high enough
	var hackable = await canHack(ns, server);
	while (!hackable) {
		await ns.sleep(60000);
		hackable = await canHack(ns, server);
	}

	// weaken or hack or grow
	while (true) {
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