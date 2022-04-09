import {filterArray, isAttackable, unionArray} from 'bit-utils.js';

/**
 * Does full hierarchal scan of the whole network, starting from the provided parent.
 * Returns all known servers back as an array for processing.
 */
export async function scanServer(ns, parent, knownServers) {
	parent = parent ?? 'home';
	knownServers = knownServers ?? [];
	// get directly connected servers
	var children = await ns.scan(parent);
	var filteredChildren = filterArray(children, knownServers);
	filteredChildren = filteredChildren.filter(e => (isAttackable(e)));
	var updatedKnown = unionArray(filteredChildren, knownServers);
	// get next tier of connected servers 
	for (const _parent of filteredChildren) {
		var _children = await scanServer(ns, _parent, updatedKnown);
		var _filteredChildren = filterArray(_children, knownServers);
		_filteredChildren = _filteredChildren.filter(e => (e != ('home')));
		// filtering out '.' because scripts cant handle as an argment
		_filteredChildren = _filteredChildren.filter(e => (e != ('.')));
		_filteredChildren = _filteredChildren.filter(e => (isAttackable(e)));
		var updatedKnown = unionArray(_filteredChildren, knownServers);
	}
	return updatedKnown.sort();
}