/** @param {NS} ns **/
export async function main(ns) {

	// parse args
	const hostServer = ns.args[0] ?? 'home';
	const scripts = ns.args.slice(1, ns.args.length);

	// get connected servers
	var unhackedServers = ns.scan(hostServer);
	unhackedServers = unhackedServers.filter(e => e !== 'home');

	for (var i = 0; i < unhackedServers.length; i++) {

		var targetServer = unhackedServers[i];

		for (var j = 0; j < scripts.length; j++) {
			startScript(ns, scripts[j], hostServer, targetServer, 1);
		}

		await ns.sleep(1000);
	}
}

function startScript(ns, script, hostServer, targetServer, threads) {
	ns.exec(script, hostServer, threads, targetServer);
}