import {filterArray, isAttackable, unionArray} from 'bit-utils.js';

/**
 * Does full hierarchal scan of the whole network, starting from the provided parent.
 * logs all known servers with thier parents/children for visibility.
 */
export async function main(ns) {
	await scanHierarchy(ns);
}

export async function scanHierarchy(ns, parent, parentRef, knownServers) {
	parent = parent ?? 'home';
	parentRef = parentRef ?? parent;
	knownServers = knownServers ?? [];

	// get directly connected servers
	ns.tprint(parentRef);
	var children = await ns.scan(parent);
	var filteredChildren = filterArray(children, knownServers);
	filteredChildren = filteredChildren.filter(e => (isAttackable(e)));
	var updatedKnown = unionArray(filteredChildren, knownServers);
	// get relatives of connected servers 
	for (const _parent of filteredChildren) {
		var _parentRef = parentRef +'->'+ _parent;
		var _children = await scanHierarchy(ns, _parent, _parentRef, updatedKnown);
		var _filteredChildren = filterArray(_children, knownServers);
		_filteredChildren = _filteredChildren.filter(e => (isAttackable(e)));
		var updatedKnown = unionArray(_filteredChildren, knownServers);
	}
	return updatedKnown.sort();
}