/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	const hostServer = ns.args[0] ?? "home";	
	// get connected servers
	const targetServers = await ns.scan(hostServer);
	ns.tprint(targetServers);
	// push scripts
	for (var i = 0; i < targetServers.length; i++) {
		var targetServer = targetServers[i];
		// nuke server
		//var openPorts = await ns.getServerNumPortsRequired(targetServer);
		//for (var j = 0; j <= openPorts; j++) {
			//await ns.brutessh(targetServer);
			//await ns.ftpcrack(targetServer);
		//}
		await ns.nuke(targetServer);
		// push scripts to server
		await ns.run("clone-script.js", 1, targetServer);
	}
}