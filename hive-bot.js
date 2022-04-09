import {scanServer} from 'cerebro.js';
import {compare} from 'bit-utils.js';
import {execThreaded, killAllScripts} from 'script-utils.js';
import {buildServerRefs, calcThreadsPerInst, copyAllFiles, waitForMoney} from 'server-utils.js';

/**
 * todo
 */
export async function main(ns) {
	ns.disableLog('scp');	
	var serverSize = ns.args[0] ?? 32;
	await createSwarm(ns, serverSize);
}

// 
async function createSwarm(ns, serverSize) {
	while (true) {
		var serverPrice = await ns.getPurchasedServerCost(serverSize);
		var filteredServers = await lookupServersToHack(ns);
		var hives = buildHiveArrays(ns, filteredServers);
		var hiveSize = hives.size;
		ns.print('A'+hiveSize);
		await ns.sleep(6000);
		for (var i = 0; i < hiveSize; i++) {
			// check if exists
			var newServer = 'swarm-' + i;
			var exists = await ns.serverExists(newServer);
			if (exists) {
				exists = await refreshServer(ns, newServer, serverSize);
			}
			if (!exists) {	
				await createServer(ns, newServer, serverSize, serverPrice);	
			}
			await startServer(ns, newServer, hives.get(i));
		}

		if (serverSize > 1048576) { break; }
		ns.print('old server size: ' + serverSize.toString());
		serverSize = getServerSize(serverSize);
		ns.print('new server size: ' + serverSize.toString());
		await ns.sleep(serverSize * 50);
	} 
}

/** todo */
function getServerSize(serverSize) {
	serverSize = serverSize * 4;
	if (serverSize <= 0 || serverSize >= 1048576) {
		serverSize = 1048576;
	}
	return serverSize;
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
	var currentServerSize = await ns.getServerMaxRam(server);
	var exists = true;
	if (serverSize > currentServerSize) {
		await ns.deleteServer(server);
		exists = false;
	}
	return exists;
}

/** todo */
async function startServer(ns, hostServer, targetServers) {
	var script = 'hack-seq.js';
	var systemUsage = .95;
	var hiveSize = targetServers.length;
	await copyAllFiles(ns, 'home', hostServer);
	let threads = await calcThreadsPerInst(ns, hostServer, script, hiveSize, systemUsage);
	for (var i = 0; i < hiveSize; i++) {
		await execThreaded(ns, hostServer, script, threads, [targetServers[i].serverName]);
	}
}

/** todo */
function buildHiveArrays(ns, servers) {
	var hives = new Map();
	var hiveCount = 10;
	if (servers.length <= 25) {		
		var i = 0;
		for (const server of servers) {
			hives.set(i++, [server]);
		}
	} else {		
		var splitIndex = servers.length - (25 - hiveCount);
		var j = 0;
		for (var i = 0; i < 25; i++) {
			var _servers = [];
			if (i < hiveCount) {
				var base = ~~(splitIndex/hiveCount);
				var remainder = (splitIndex%hiveCount);
				if (remainder === i) {
					base = base + 1;
				}
				var max = j + base;
				for (j; j < max; j++) {
					_servers.push(servers[j]);
				}
			} else {
				_servers.push(servers[j++]);
			}
			hives.set(i, _servers);
		}
	}
	return hives;
}