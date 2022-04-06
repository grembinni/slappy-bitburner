import {scanServer} from 'cerebro.js';
import {buildServerRefs, calculateThreadsPerInstance, runThreaded} from 'bit-utils.js';

export async function main(ns) {
   	// // ---------------------------------------------------
	//let threads = await calculateThreadsPerInstance(ns, 'home', 'run-hack-seq.js', 1, .85)
	// await runThreaded(ns, 'home', 'run-hack-seq.js', threads, ['n00dles']);
	//await runThreaded(ns, 'home', 'run-hack-seq.js', threads, ['iron-gym']);
	// // ---------------------------------------------------
	ns.tprint(ns.getPurchasedServerCost(256));
	ns.tprint(ns.getPurchasedServerCost(512));
	ns.tprint(ns.getPurchasedServerCost(1024));
	ns.tprint(ns.getPurchasedServerCost(2048));

	let _servers = await scanServer(ns, 'home');
	let servers = await buildServerRefs(ns, _servers)
	servers.sort((a, b) => sortByMaxMoney(ns, a, b));
	for (const server of servers) {
		ns.tprint(server.serverName + ':' + server.maxMoney);
	}

	//ns.tprint(await ns.getServerMoneyAvailable('nova-med'));
	//ns.tprint(ns.heart.break());
	//ns.tprint(ns.exploit());
	// ns.commitCrime();
	// // ---------------------------------------------------
	// var hRam = await ns.getServerMaxRam('home');
	// ns.tprint(hRam);
	// var rRam = await ns.getServerMaxRam('n00dles');
	// ns.tprint(rRam);
	// ns.tprint(rRam/hRam);
	// rRam = await ns.getServerMaxRam('iron-gym');
	// ns.tprint(rRam);
	// ns.tprint(rRam/hRam);
	// rRam = await ns.getServerMaxRam('microdyne');
	// ns.tprint(rRam);
	// ns.tprint(rRam/hRam);
	// // ---------------------------------------------------
	// var rSecurity = await ns.getServerMinSecurityLevel('n00dles');
	// ns.tprint(rSecurity);
	// rSecurity = await ns.getServerMinSecurityLevel('iron-gym');
	// ns.tprint(rSecurity);
	// rSecurity = await ns.getServerMinSecurityLevel('microdyne');
	// ns.tprint(rSecurity);
	// // ---------------------------------------------------
	// var rMoney = await ns.getServerMaxMoney('n00dles');
	// ns.tprint(rMoney);
	// rMoney = await ns.getServerMaxMoney('iron-gym');
	// ns.tprint(rMoney);
	// rMoney = await ns.getServerMaxMoney('microdyne');
	// ns.tprint(rMoney);
	// // ---------------------------------------------------
	// ns.tprint(buildInstance(ns, 'nova-med', 1, 2, 'test.js'));
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

/** 
 * Create data reference for the instance.
 */
// function buildInstance(ns, server, pod, pid, script) {
// 	ns.print('server: ' + server + ', pod: ' + pod + ', pid: ' + pid + ', script: ' + script);
// 	return { 
// 		"pod": pod,
// 		"pid": pid,
// 		"script": script
// 	};
// }