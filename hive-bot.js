import {scanServer} from 'cerebro.js';
import {compare} from 'bit-utils.js';
import {execThreaded, killAllScripts} from 'script-utils.js';
import {buildServerRefs, calcThreadsPerInst, copyAllFiles, waitForMoney} from 'server-utils.js';

/**
 * todo
 */
export async function main(ns) {
	ns.disableLog('scp');	
	var serverSize = ns.args[0] ?? 64;
	await createSwarm(ns, serverSize);
}

// 
async function createSwarm(ns, serverSize) {
	while (true) {
		var serverPrice = await ns.getPurchasedServerCost(serverSize);
		var filteredServers = await lookupServersToHack(ns);
		var hives = buildHiveArrays(ns, filteredServers);
		ns.print('A'+hives.size);
		for (var i = 0; i < hives.size; i++) {
			// check if exists
			var newServer = 'swarm-' + i++;
			var exists = await ns.serverExists(newServer);
			
			ns.print('B'+hives.size);
			if (exists) {
				ns.print('B'+hives.size);
				exists = await refreshServer(ns, newServer, serverSize);
			}
			
			ns.print('C'+hives.size);
			if (!exists) {	
				ns.print('C'+hives.size);
				await createServer(ns, newServer, serverSize, serverPrice);	
			}
			
			ns.print('D'+hives.size);
			await startServer(ns, newServer, hives.get(i));
			
			if (i >= 25) { break; }
		}

		ns.print('old server size: ' + serverSize.toString());
		serverSize = getServerSize(serverSize);
		ns.print('new server size: ' + serverSize.toString());
		if (serverSize > 1048576) { break; }
		await ns.sleep(serverSize * 500);
	} 
}

/** todo */
function getServerSize(serverSize) {
	
	if (serverSize <= 0 || serverSize >= 1048576) {
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
async function startServer(ns, server, targetServers) {
	ns.print('a:'+targetServers.length);
	var script = 'hack-seq.js';
	var systemUsage = .95;
	await copyAllFiles(ns, 'home', server);
	let threads = await calcThreadsPerInst(ns, server, script, targetServers.length, systemUsage);
	
	for (var i = 0; i < targetServers.length; i++) {
		await execThreaded(ns, server, script, threads, [targetServers[i].serverName]);
	}
}

/** todo */
function buildHiveArrays(ns, servers) {
	var hives = new Map();
	ns.print('1:'+hives.size);
	ns.print('2:'+servers.length);
	if (servers.length <= 25) {		
		ns.print('3:'+hives.size);
		var i = 0;
		for (const server of servers) {
			ns.print('3.1:'+hives.size);
			hives.set(i++, [server]);
		}
	} else {		
		ns.print('4:'+hives.size);
		var splitIndex = servers.length - 20;
		var j = 0;
		for (var i = 0; i < 25; i++) {
			ns.print('5:'+i);
			var _servers = [];
			if (i < 5) {
				var base = ~~(splitIndex/5);
				var remainder = (splitIndex%5);
				if (remainder === i) {
					ns.print('5.0:'+', '+base+', '+remainder);
					base = base + 1;
				}
				var max = j + base;
				for (j; j < max; j++) {
					ns.print('5.1:'+i+', '+j+', '+base+', '+remainder);
					_servers.push(servers[j]);
				}
			} else {
				ns.print('6:'+i+', '+j);
				_servers.push(servers[j++]);
			}
			hives.set(i, [_servers]);
			ns.print('7:'+hives.size);
		}
	}
	ns.print('8:'+hives.size);
	return hives;
}