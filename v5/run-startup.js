import {attackAllServers} from 'attack-utils.js';
import {copyAllFiles, killAll} from 'server-utils.js';
import {runSingle, execThreaded} from 'thread-utils.js';
import {scanServer} from 'cerebro.js';

export async function main(ns) {
	await attackAllServers(ns);
	await ns.sleep(500);
	await warmupAllServers(ns);
	await ns.sleep(500);
	await runSingle(ns, 'run-status.js');
	await ns.sleep(500);
	await runSingle(ns, 'run-netbot.js');
	await ns.sleep(500);
	await runSingle(ns, 'run-simple-monitor.js', ['microdyne']);
}

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
 		await killAll(ns, server);
 		await execThreaded(ns, server, 'run-warmup.js', 1, [server]);
	} else {
		ns.tprint('not enough money on ' + server + ' to run run-warmup.js');
	}
}