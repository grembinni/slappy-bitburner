import {scanServer} from 'cerebro.js';

/** attack all servers */
export async function attackAllServers(ns) {
	var servers = await scanServer(ns, 'home', []);
	await attackServers(ns, servers);
}

/** attack all servers */
export async function attackProvidedServers(ns, hostServer) {
	await attackServers(ns, servers);
}

/** attack provided servers */
export async function attackServers(ns, servers) {	
	ns.tprint(servers);
	var skipped = 0;
	// attack all
	for (const server of servers) {
		var success = await attackServer(ns, server);
		if (!success) {
			skipped++;
		}
	}
	ns.tprint('servers attacked: ' + servers.length);
	ns.tprint('servers skipped: ' + skipped);
}

/** attack a single server */
export async function attackServer(ns, server) {	
	ns.tprint('attacking -> ' + server);
	// open ports
	await openPorts(ns, server);
	// nuke server
	try {
		await ns.nuke(server);
		ns.tprint('nuked -> ' + server);
		return true;
	} catch(e) {
		ns.tprint('skipped -> ' + server);
		return false;
	}
}

/** get port count and try all available attacks */
export async function openPorts(ns, server) {	
	var numPortsRequired = await ns.getServerNumPortsRequired(server);
	for(var i = 0; i < numPortsRequired; i++) {
		if (ns.fileExists('BruteSSH.exe')) {
			await ns.brutessh(server);
		}
		if (ns.fileExists('FTPCrack.exe')) {
			await ns.ftpcrack(server);
		}	
		if (ns.fileExists('relaySMTP.exe')) {
			await ns.relaysmtp(server);
		}	
		if (ns.fileExists('HTTPWorm.exe')) {
			await ns.httpworm(server);
		}
		if (ns.fileExists('SQLInject.exe')) {
			await ns.sqlinject(server);
		}
	}
}