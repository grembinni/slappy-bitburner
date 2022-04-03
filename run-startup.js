import {scanServer} from 'cerebro.js';
import {attackServers, copyAllFiles, execThreadedAutoCalculated, killAllScripts, runSingle} from 'bit-utils.js';

export async function main(ns) {
	await attackAllServers(ns);
	await ns.sleep(500);
	await warmupAllServers(ns);
	await ns.sleep(500);
	await runSingle(ns, 'run-status-all.js');
	await ns.sleep(500);
	await runSingle(ns, 'run-netbot.js');
	await ns.sleep(500);
	// 'iron-gym'
	// 'microdyne'
	await runSingle(ns, 'run-monitor-prototype.js', ['iron-gym']);
}

/** attack all servers */
export async function attackAllServers(ns) {
	var servers = await scanServer(ns, 'home', []);
	await attackServers(ns, servers);
}

/** start default self attack scripts on all open servers */
async function warmupAllServers(ns) {
	var servers = await scanServer(ns, 'home', []);
	for (const server of servers) {
		await prepServerForWarmup(ns, server);
	}
}

async function prepServerForWarmup(ns, server) {
 	await copyAllFiles(ns, server);
	var maxMoney = await ns.getServerMaxMoney(server);
	if (maxMoney > 0) {
 		await killAllScripts(ns, server);
 		await execThreadedAutoCalculated(ns, server, 'run-hack-seq.js', 1, [server]);
	} else {
		ns.tprint('not enough money on ' + server + ' to run run-hack-seq.js');
	}
}