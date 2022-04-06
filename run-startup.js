import {scanServer} from 'cerebro.js';
import {attackServers, calculateThreadsPerInstance, copyAllFiles, execThreaded, killAllScripts, runSingle} from 'bit-utils.js';

export async function main(ns) {
	await attackAllServers(ns);
	await ns.sleep(500);
	await warmupAllServers(ns);
	await ns.sleep(500);
	await runSingle(ns, 'run-status-all.js');
	await ns.sleep(500);
	// await runSingle(ns, 'run-netbot.js');
	await ns.sleep(500);
	// 'foodnstuff'
	// 'iron-gym'
	// 'microdyne'
	await runSingle(ns, 'run-swarm.js');
}

/** attack all servers */
export async function attackAllServers(ns) {
	ns.print('attackAllServers');
	var servers = await scanServer(ns, 'home');
	await attackServers(ns, servers);
}

/** start default self attack scripts on all open servers */
async function warmupAllServers(ns) {
	ns.print('warmupAllServers');
	var servers = await scanServer(ns, 'home');
	for (const server of servers) {
		await prepServerForWarmup(ns, server);
	}
}

async function prepServerForWarmup(ns, server) {
	ns.print('server: ' + server + ' prepServerForWarmup');
 	await copyAllFiles(ns, 'home', server);
	var maxMoney = await ns.getServerMaxMoney(server);
	var script = 'run-hack-seq.js';
	if (maxMoney > 0) {
 		await killAllScripts(ns, server);
		var threads = await calculateThreadsPerInstance(ns, server, script);
 		await execThreaded(ns, server, script, threads, [server]);
		ns.print('server: ' + server + ' run ' + script);
	} else {
		ns.print('server: ' + server + ' not enough money on to run ' + script);
		// ns.tprint('server: ' + server + ' not enough money on to run ' + script);
	}
}