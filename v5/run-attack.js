import {scanServer} from 'cerebro.js';
import {attackServers, filterArray, isAttackable} from 'bit-utils.js';

/**
 * Attack all servers. Repeat attacks until all servers are unlocked.
 */
export async function main(ns) {
	ns.disableLog('ALL');	
	await attackAllServers(ns);
}

/** 
 * attack all servers 
 */
async function attackAllServers(ns) {
	ns.print('attackAllServers');
	let servers = await scanServer(ns, 'home');
	let unNukedServers = servers;
	unNukedServers = unNukedServers.filter(e => (isAttackable(e)));
	while (unNukedServers.length > 0) {
		let nukedServers = await attackServers(ns, unNukedServers);
		ns.print('servers successfully attacked: ' + nukedServers.length);
		unNukedServers = filterArray(unNukedServers, nukedServers);
		await ns.sleep(6000);
	}
}