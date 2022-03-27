/** @param {NS} ns **/
export async function main(ns) {
	// parse arguments
	var server = ns.args[0] ?? "n00dles";
	var script = ns.args[1] ?? "hack.js";
	// calculate thread count
	var threads = calculateThreadCount(ns, server, script);
	// run script
	await ns.exec(script, server, threads, server);
}

/** calculate thread count */
async function calculateThreadCount(ns, server, script) {
	var serverMaxRam = ns.getServerMaxRam(server);
	var serverUsedRam = ns.getServerUsedRam(server);
	var scriptRam = ns.getScriptRam(script);
	return parseInt((serverMaxRam - serverUsedRam) / scriptRam);
}