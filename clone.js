/** @param {NS} ns **/
export async function main(ns) {
	var server = ns.args[0];
	var script = ns.args[1] ?? "hack.js";

	console.log(server);
	console.log(script);
	await ns.scp(script, server);

	var serverMaxRam = ns.getServerMaxRam(server);
	var serverUsedRam = ns.getServerUsedRam(server);
	var scriptRam = ns.getScriptRam(script);
	var threads = parseInt((serverMaxRam - serverUsedRam) / scriptRam);
	await ns.exec(script, server, threads, server);
}