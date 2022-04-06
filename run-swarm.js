import {scanServer} from 'cerebro.js';
import {attackServers, buildServerRefs, calculateThreadsPerInstance, copyAllFiles, execThreaded, killAllScripts} from 'bit-utils.js';

/**
 * todo
 */
export async function main(ns) {
	
	let serverSize = ns.args[0] ?? 512;
	let serverPrice = await ns.getPurchasedServerCost(serverSize);
	//let processedServers = [];
	
	//while (true) {
		// load all servers
		let _servers = await scanServer(ns, 'home');		
		await attackServers(ns, _servers);
		let servers = await buildServerRefs(ns, _servers)
		let processedServers = [];
		let filteredServers = await filterServers(ns, servers, processedServers);
		filteredServers.sort((a, b) => sortByMaxMoney(ns, a, b));
		let i = 0;
		for (const filteredServer of filteredServers) {
			// check if exists
			let newServer = 'swarm-' + i++;
			let exists = await ns.serverExists(newServer);
			if (exists) {
 				await killAllScripts(ns, newServer);
				let currentServerSize = ns.getServerMaxRam(newServer);
				if (serverSize > currentServerSize) {
					ns.deleteServer(newServer);
					exists = false;
				}
			}
			if (!exists) {	
				let funding = await isMoneyAvailable(ns, serverPrice);
				while (!funding) {
					await ns.sleep(5000);
					funding = await isMoneyAvailable(ns, serverPrice);
				}
				// setup server	
				await ns.purchaseServer(newServer, serverSize);	
				await ns.sleep(5000);	
			}
			await copyAllFiles(ns, 'home', newServer);
			let threads = await calculateThreadsPerInstance(ns, newServer, 'run-hack-seq.js', 1, .95);
			await execThreaded(ns, newServer, 'run-hack-seq.js', threads, [filteredServer.serverName]);
			// add to processed
			processedServers.push(newServer);
			if (processedServers.length >= 25) {
				break;
			}
		//}
	} 
}

/** todo */
async function filterServers(ns, servers, processedServers) {
	var playerHackLevel = await ns.getHackingLevel();
	ns.tprint(servers.length);
	// for (const p of processedServers) {
	// 	servers = servers.filter(e => (e.serverName != p.serverName));
	// }
	servers = servers.filter(e => (e.maxMoney > 0));
	ns.tprint(servers.length);
	servers = servers.filter(e => (e.rootAccess));
	ns.tprint(servers.length);
	servers = servers.filter(e => (e.requiredHackingLevel < playerHackLevel));
	ns.tprint(servers.length);
	return servers;
}

/** todo */
async function isMoneyAvailable(ns, cost) {
	var moneyAvailable = await ns.getServerMoneyAvailable('home');
	await ns.sleep(50);
	while(cost > moneyAvailable) {
		await ns.sleep(5000);
		moneyAvailable = await ns.getServerMoneyAvailable('home');	
		await ns.sleep(50);			
	}
	return true;
}
/** todo */
function sortByMaxMoney(ns, a, b) {
	let sort = 0
	if (a.maxMoney < b.maxMoney) {
		sort = 1;
	} else if (a.maxMoney > b.maxMoney) {
		sort = -1;
	}
	return sort;
}