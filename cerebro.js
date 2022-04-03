/**
 * Does full hierarchal scan of the whole network, starting from the provided parent.
 * Returns all known servers back as an array for processing.
 */
export async function scanServer(ns, parent, knownServers) {
	parent = parent ?? 'home';
	knownServers = knownServers ?? [];
	// get directly connected servers
	var children = await ns.scan(parent);
	var filteredChildren = filter(children, knownServers);
	var updatedKnown = union(filteredChildren, knownServers);
	// get next tier of connected servers 
	for (const _parent of filteredChildren) {
		var _children = await scanServer(ns, _parent, updatedKnown);
		var _filteredChildren = filter(_children, knownServers);
		var updatedKnown = union(_filteredChildren, knownServers);
	}
	return updatedKnown.sort();
}

/** removes already known servers from the new server list */
function filter(newServers, knownServers) {
	var servers = [];
	if (newServers) {
		servers = newServers.filter(e => (knownServers.indexOf(e) === -1));
		servers = servers.filter(e => (e != ('home')));
		// filtering out '.' because scripts cant handle as an argment
		servers = servers.filter(e => (e != ('.')));
	}	
	return servers;
}

/** joins 2 arrays */
function union(first, second) {
	return [...first, ...second];
}