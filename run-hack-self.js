import {scanServer} from 'cerebro.js';
import {buildServerRefs, calcThreadsPerInst, copyAllFiles, execThreaded, filterArray, isAttackable, killAllScripts} from 'bit-utils.js';

export async function main(ns) {
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
	serverRefs = filterServersToHack(ns, serverRefs); 
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
			hackedServers.push(await selfHackServer(ns, serverAbleToHack));
		}
		ns.print('servers successfully self hacked: ' + hackedServers.length);
		serversToHack = filterArray(serversToHack, hackedServers);
		await ns.sleep(60000);
	}
}

async function selfHackServer(ns, server) {
	var serverName = server.serverName;
	ns.print('server: ' + serverName + ' selfHack');
 	await copyAllFiles(ns, 'home', serverName);
	let script = 'run-hack-seq.js';
	await killAllScripts(ns, serverName);
	let threads = await calcThreadsPerInst(ns, serverName, script);
	await execThreaded(ns, serverName, script, threads, [serverName]);
	ns.print('server: ' + serverName + ' run ' + script);
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