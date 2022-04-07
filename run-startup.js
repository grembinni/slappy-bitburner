import {scanServer} from 'cerebro.js';
import {calculateThreadsPerInstance, copyAllFiles, execThreaded, killAllScripts, runSingle} from 'bit-utils.js';

export async function main(ns) {
	await runSingle(ns, 'run-status-all.js');
	await ns.sleep(500);
	await runSingle(ns, 'run-attack.js');
	await ns.sleep(500);
	await runSingle(ns, 'run-swarm.js');
	await ns.sleep(500);
	// await runSingle(ns, 'run-netbot.js', [9]);
	await ns.sleep(500);
	await warmupAllServers(ns);
}

/** start default self attack scripts on all open servers */
async function warmupAllServers(ns) {
	ns.print('warmupAllServers');
	let servers = await scanServer(ns, 'home');
	for (const server of servers) {
		await prepServerForWarmup(ns, server);
	}
}

async function prepServerForWarmup(ns, server) {
	ns.print('server: ' + server + ' prepServerForWarmup');
 	await copyAllFiles(ns, 'home', server);
	let maxMoney = await ns.getServerMaxMoney(server);
	let script = 'run-hack-seq.js';
	if (maxMoney > 0) {
 		await killAllScripts(ns, server);
		let threads = await calculateThreadsPerInstance(ns, server, script);
 		await execThreaded(ns, server, script, threads, [server]);
		ns.print('server: ' + server + ' run ' + script);
	} else {
		ns.print('server: ' + server + ' not enough money on to run ' + script);
		// ns.tprint('server: ' + server + ' not enough money on to run ' + script);
	}
}