/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	const hostServer = ns.args[0] ?? 'home';	
	// get connected servers
	const targetServers = await ns.scan(hostServer);
	ns.tprint(targetServers);
	// attack all
	for (const targetServer of targetServers) {
		ns.tprint('targetServer: ' + targetServer);
		// open ports
		await openPorts(ns, targetServer)
		// nuke server
		await ns.nuke(targetServer);
		ns.installBackdoor;
		// push scripts to server
		await ns.run('clone-script.js', 1, targetServer);
	}
}

/** check the funds on the target server */
async function openPorts(ns, server) {	
	var openPorts = await ns.getServerNumPortsRequired(server);
	ns.tprint('targetServer: ' + server + ' openPorts: ' + openPorts);
	for (var i = 0; i < openPorts; i++) {
		if (ns.fileExists('BruteSSH.exe', 'home')) {
			await ns.brutessh(server);
		}
		if (ns.fileExists('FTPCrack.exe', 'home')) {
			await ns.ftpcrack(server);
		}	 
	};
}