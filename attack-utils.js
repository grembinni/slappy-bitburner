/** 
 * Attacks all servers with available software.
 * Returns an array of all servers that were successfully hacked.
 */
export async function attackServers(ns, servers) {	
	ns.print(servers);
	var skipped = 0;
	var attackedServers = [];
	// attack all
	for (const server of servers) {
		var success = await attackServer(ns, server);
		if (success) {
			attackedServers.push(server); // push to attacked array
		} else {
			skipped++; // count for logging
		}
	}
	ns.print('servers attacked: ' + servers.length);
	// ns.tprint('servers attacked: ' + servers.length);
	ns.print('servers skipped: ' + skipped);
	// ns.tprint('servers skipped: ' + skipped);

	return attackedServers;
}

/** 
 * Attacks server with available software.
 * Returns a boolean indicating if the server was successfully hacked.
 */
export async function attackServer(ns, server) {	
	// ns.tprint('attacking -> ' + server);
	// open ports
	await openPorts(ns, server);
	// nuke server
	try {
		await ns.nuke(server);
		ns.print('server: ' + server + ' NUKED! ');
		return true;
	} catch(e) {
		ns.print('server: ' + server + ' ## skipped ##');
		// ns.tprint('server: ' + server + ' ## skipped ##');
		return false;
	}
}

/** 
 * Filter of servers not to hack. 
 */
export function isAttackable(server) {
	return !server.startsWith('swarm') && (server != 'home');
}

/** 
 * Get port count and try all available attacks exe's.
 */
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