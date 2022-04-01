/** @param {NS} ns **/
export async function main(ns) {
	ns.tprint(ns.args);
	// parse arguments
	var server = ns.args[0] ?? 'n00dles';
	var script = ns.args[1] ?? 'hack-server.js';
	var systemUsage = ns.args[2] ?? 1;
	var args = getArgs(ns, server);
	// calculate thread count
	var threads = await calculateThreadCount(ns, server, script, systemUsage);
	// run script
	await ns.exec(script, server, threads, ...args);
}

/** calculate thread count */
async function calculateThreadCount(ns, server, script, systemUsage) {
	var serverMaxRam = await ns.getServerMaxRam(server);
	var serverUsedRam = await ns.getServerUsedRam(server);
	var scriptRam = await ns.getScriptRam(script);
	return parseInt(((serverMaxRam - serverUsedRam) * systemUsage) / scriptRam);
}

/** validate arg size to set script var */
function getArgs(ns, server) {
	var args = [server];	
	if (ns.args.length > 3) {
		args = ns.args.slice(3, ns.args.length);
	}
	return args;
}