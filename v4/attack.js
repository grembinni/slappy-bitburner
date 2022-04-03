/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	const hostServer = ns.args[0] ?? 'home';	
	// get connected servers
	const targetServers = await ns.scan(hostServer);
	ns.tprint(targetServers);
	// attack all
	for (const targetServer of targetServers) {
		// open ports
		openPorts(ns, targetServer)
		// nuke server
		await ns.nuke(targetServer);
		// push scripts to server
		await ns.run('clone.js', 1, targetServer);
	}
}

/** check the funds on the target server */
async function openPorts(ns, server) {	
	var openPorts = await ns.getServerNumPortsRequired(server);
	openPorts.forEach(async () => {
		if (ns.fileExists('BruteSSH.exe')) {
			await ns.brutessh(server);
		}
		if (ns.fileExists('FTPCrack.exe')) {
			await ns.ftpcrack(server);
		}	 
	});
}