import {scanServer} from 'cerebro.js';
import {attackServers, buildServerRefs, calcThreadsPerInst, compare, copyAllFiles, execThreaded, killAllScripts, waitForMoney} from 'bit-utils.js';

/**
 * todo
 */
export async function main(ns) {	
	ns.disableLog('ALL');
	var serverSize = ns.args[0] ?? 64;
	await createSwarm(ns, serverSize);
}

// 
async function createSwarm(ns, serverSize) {
	while (true) {
		var serverPrice = await ns.getPurchasedServerCost(serverSize);
		var filteredServers = await lookupServersToHack(ns);
		var i = 0;
		for (const filteredServer of filteredServers) {
			// check if exists
			var newServer = 'swarm-' + i++;
			var exists = await ns.serverExists(newServer);
			if (exists) {
				exists = await refreshServer(ns, newServer, serverSize);
			}
			if (!exists) {	
				await createServer(ns, newServer, serverSize, serverPrice);	
			}
			await startServer(ns, newServer, filteredServer.serverName);
			
			if (i >= 25) { break; }
		}

		await ns.print('old server size: ' + serverSize);
		serverSize = getServerSize(serverSize);
		await ns.print('old server size: ' + serverSize);
		if (serverSize > 500000) { break; }
		await ns.sleep(3600000);
	} 
}

/** todo */
function getServerSize(serverSize) {
	
	if (serverSize <= 0 || serverSize >= 500000) {
		serverSize = 99999999;
	}
	return serverSize = serverSize * 2;
}

/** todo */
async function createServer(ns, server, serverSize, serverPrice) {
	await waitForMoney(ns, serverPrice);
	await ns.purchaseServer(server, serverSize);	
	await ns.sleep(500);
}

/** todo */
async function lookupServersToHack(ns) {
	// lookup all servers
	var servers = await scanServer(ns, 'home');
	var serverRefs = await buildServerRefs(ns, servers);	
	// attack the servers before run
	await attackServers(ns, servers);
	// filter and sort service to hack
	var filteredServers = await filterServersToHack(ns, serverRefs);
	filteredServers.sort((a, b) => compare(ns, a.maxMoney, b.maxMoney, false));

	return filteredServers;
}

/** todo */
async function filterServersToHack(ns, servers) {
	var playerHackLevel = await ns.getHackingLevel();
	ns.print("# servers: " + servers.length);
	servers = servers.filter(e => (e.maxMoney > 0));
	ns.print("# servers with money: " + servers.length);
	servers = servers.filter(e => (e.rootAccess));
	ns.print("# servers with root access: " + servers.length);
	servers = servers.filter(e => (e.requiredHackingLevel <= playerHackLevel));
	ns.print("# servers able to hack: " + servers.length);
	return servers;
}

/** todo */
async function refreshServer(ns, server, serverSize) {
	await killAllScripts(ns, server);
	var currentServerSize = ns.getServerMaxRam(server);
	var exists = true;
	if (serverSize > currentServerSize) {
		await ns.deleteServer(server);
		exists = false;
	}
	return exists;
}

/** todo */
async function startServer(ns, server, targetServer) {
	var script = 'run-hack-seq.js';
	var systemUsage = .95;
	await copyAllFiles(ns, 'home', server);
	let threads = await calcThreadsPerInst(ns, server, script, 1, systemUsage);
	await execThreaded(ns, server, script, threads, [targetServer]);
}