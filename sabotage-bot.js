import { scanServer } from 'cerebro.js';
import {isAttackable} from 'attack-utils.js';
import {execThreaded, killAllScripts} from 'script-utils.js';
import {buildServerRefs, copyAllFiles, calcThreadsPerInst} from 'server-utils.js';

export async function main(ns) {
	
	ns.disableLog('scp');	
	await selfHackAllServers(ns);
}

/** 
 * self hack all servers 
 */
async function selfHackAllServers(ns) {
	ns.print('selfHackAllServers');
	// pull all servers
	var servers = await scanServer(ns, 'home');
	// filter servers to target
	servers = servers.filter(e => (isAttackable(e)));
	var serverRefs = await buildServerRefs(ns, servers);
	serverRefs = await filterServersToHack(ns, serverRefs);
	// self hack all
	await selfHackServers(ns, serverRefs);
}

/** 
 * self hack all servers 
 */
async function selfHackServers(ns, serversToHack) {
	ns.print('selfHackServers');
	while (serversToHack.length > 0) {
		var serversAbleToHack = await filterServersAbleToHack(ns, serversToHack);
		var hackedServers = [];
		for (const serverAbleToHack of serversAbleToHack) {
			var hackedServer = await selfHackServer(ns, serverAbleToHack)
			hackedServers.push(hackedServer);
		}
		serversToHack = removeHackedServers(ns, serversToHack, hackedServers);
		await ns.sleep(60000);
	}
}

/** todo */
function removeHackedServers(ns, servers, hackedServers) {
	ns.print('servers to hack: ' + servers.length);
	ns.print('servers hacked: ' + hackedServers.length);
	for (const h of hackedServers) {
		servers = servers.filter(s => (s.serverName != h.serverName));
	}
	ns.print('remaining servers to hack: ' + servers.length);

	return servers;
}

async function selfHackServer(ns, server) {
	ns.print('server: ' + server.serverName + ' selfHack');
	// setup params
	var bookstoreScript = 'bookstore.js';
	var hackScript = 'hack-seq.js';
	var serverName = server.serverName;
	var threads = await calcThreadsPerInst(ns, serverName, hackScript);
	// prep server
	await killAllScripts(ns, serverName);
	await ns.sleep(600);
	await copyAllFiles(ns, 'home', serverName);
	await ns.sleep(600);
	ns.print('server: ' + serverName + ', run: ' + bookstoreScript + ', threads: 1, args: ' + [serverName]);
	await execThreaded(ns, serverName, bookstoreScript, 1, [serverName]);
	await ns.sleep(6000);
	// start hack 
	ns.print('server: ' + serverName + ', run: ' + hackScript + ', threads: ' + threads + ', args: ' + [serverName]);
	await execThreaded(ns, serverName, hackScript, threads, [serverName]);

	return server;
}

/** todo */
function filterServersToHack(ns, servers) {
	ns.print("# servers: " + servers.length);
	servers = servers.filter(e => (e.maxMoney > 0));
	ns.print("# servers with money: " + servers.length);
	servers = servers.filter(e => (e.maxRam > 0));
	ns.print("# servers with RAM: " + servers.length);
	return servers;
}

/** todo */
async function filterServersAbleToHack(ns, servers) {
	var playerHackLevel = await ns.getHackingLevel();
	ns.print("# servers: " + servers.length);
	servers = servers.filter(e => (e.rootAccess));
	ns.print("# servers with root access: " + servers.length);
	servers = servers.filter(e => (e.requiredHackingLevel <= playerHackLevel));
	ns.print("# servers able to hack: " + servers.length);
	return servers;
}