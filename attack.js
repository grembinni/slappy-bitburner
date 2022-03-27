/** @param {NS} ns **/
export async function main(ns) {
	var server = ns.args[0];
	var script = ns.args[1] ?? "clone.js";

	await ns.nuke(server);
	await ns.scp(script, server);
	await ns.run(script, 1, server);
}