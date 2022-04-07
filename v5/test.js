import {scanServer} from 'cerebro.js';
import {buildServerRefs} from 'bit-utils.js';

export async function main(ns) {
	ns.tprint(ns.getServerMaxRam('swarm-0'));
	ns.tprint(64 +''+ ns.getPurchasedServerCost(64));	
	ns.tprint(128 +''+ ns.getPurchasedServerCost(128));	
	ns.tprint(256 +''+ ns.getPurchasedServerCost(256));
	ns.tprint(512 +''+ ns.getPurchasedServerCost(512));
	ns.tprint(1024 +''+ ns.getPurchasedServerCost(1024));
	ns.tprint(2048 +''+ ns.getPurchasedServerCost(2048));

	let _servers = await scanServer(ns, 'home');
	_servers = _servers.filter(e => (isAttackable(e)));
	//_servers = _servers.filter(e => (e === 'home'));
	//_servers = _servers.filter(e => (!e.startsWith('swarm')));
	let servers = await buildServerRefs(ns, _servers)
	servers.sort((a, b) => sortByMaxMoney(ns, a, b));
	for (const server of servers) {
		if (server.serverName.startsWith('swarm')) {
			ns.tprint(server.serverName + ':' + server.maxMoney);
			ns.tprint(server.serverName + ':' + server.maxMoney);
		}
	}

}
export function isAttackable(server) {
	// return !(server === ('home')) || (server.startsWith('swarm'));
	return !server.startsWith('swarm') && (server != 'home');
}

function sortByMaxMoney(ns, a, b) {
	let sort = 0
	if (a.maxMoney < b.maxMoney) {
		sort = 1;
	} else if (a.maxMoney > b.maxMoney) {
		sort = -1;
	}
	return sort;
}