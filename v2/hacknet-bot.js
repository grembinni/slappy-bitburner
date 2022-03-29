/** @param {NS} ns **/
export async function main(ns) {
	// parse args
	var nodeCount = await ns.hacknet.numNodes();	
	var upgradeThreshold = 1000000;
	// todo on 0 nodes
	// todo	
	var stepsSkipped = 0;
	while (stepsSkipped < 4) {
		stepsSkipped = 0;
		// create node
		if (nodeCount < 24) {
			await updateNode(ns, upgradeThreshold, nodeCount);
			nodeCount = await ns.hacknet.numNodes();
		} else {
			stepsSkipped = stepsSkipped + 1;
		}
		// upgrade nodes
		for (var i = 0; i < nodeCount; i++) {
			var nodeStats = await ns.hacknet.getNodeStats(i);
			var _stepsSkipped = stepsSkipped;
			// ns.tprint(nodeStats);
			if (nodeStats.level < 200) {
				await updateLevel(ns, i, upgradeThreshold, nodeStats.level);
			} else {
				_stepsSkipped = _stepsSkipped + 1;
			}
			if (nodeStats.ram < 32) {
				await updateRAM(ns, i, upgradeThreshold, nodeStats.ram);
			} else {
				_stepsSkipped = _stepsSkipped + 1;
			}
			if (nodeStats.cores < 16) {
				await updateCore(ns, i, upgradeThreshold, nodeStats.cores);
			} else {
				_stepsSkipped = _stepsSkipped + 1;
			}	
			stepsSkipped = _stepsSkipped;		
		}
		upgradeThreshold = upgradeThreshold * 1.25;
	}
}

/** todo */
async function updateLevel(ns, node, upgradeThreshold, level) {
	var canUpgrade = true;
	while(canUpgrade) {
		var upgradeCost = await ns.hacknet.getLevelUpgradeCost(node, 1);
		// ns.tprint(upgradeCost + " " + upgradeThreshold + " " + (upgradeThreshold > upgradeCost));
		if (upgradeThreshold > upgradeCost) {
			var currentCash = await ns.getServerMoneyAvailable("home");
			// ns.tprint(upgradeCost + " " + currentCash + " " + (upgradeCost > currentCash));
			while(upgradeCost > currentCash) {
				await ns.sleep(5000);
				currentCash = await ns.getServerMoneyAvailable("home");				
			}
			await ns.hacknet.upgradeLevel(node, 1);
			level = level + 1;
			canUpgrade = (level < 200)
		} else {
			canUpgrade = false;
		}
	}
}

/** todo */
async function updateRAM(ns, node, upgradeThreshold, level) {
	var canUpgrade = true;
	while(canUpgrade) {
		var upgradeCost = await ns.hacknet.getRamUpgradeCost(node, 1);
		// ns.tprint(upgradeCost + " " + upgradeThreshold + " " + (upgradeThreshold > upgradeCost));
		if (upgradeThreshold > upgradeCost) {
			var currentCash = await ns.getServerMoneyAvailable("home");
			// ns.tprint(upgradeCost + " " + currentCash + " " + (upgradeCost > currentCash));
			while(upgradeCost > currentCash) {
				await ns.sleep(5000);
				currentCash = await ns.getServerMoneyAvailable("home");
			}
			await ns.hacknet.upgradeRam(node, 1);
			level = level + 1;
			canUpgrade = (level < 64);
		} else {
			canUpgrade = false;
		}
	}
}

/** todo */
async function updateCore(ns, node, upgradeThreshold, level) {
	var canUpgrade = true;
	while(canUpgrade) {
		var upgradeCost = await ns.hacknet.getCoreUpgradeCost(node, 1);
		// ns.tprint(upgradeCost + " " + upgradeThreshold + " " + (upgradeThreshold > upgradeCost));
		if (upgradeThreshold > upgradeCost) {
			var currentCash = await ns.getServerMoneyAvailable("home");
			// ns.tprint(upgradeCost + " " + currentCash + " " + (upgradeCost > currentCash));
			while(upgradeCost > currentCash) {
				await ns.sleep(5000);
				currentCash = await ns.getServerMoneyAvailable("home");
			}
			await ns.hacknet.upgradeRam(node, 1);
			level = level + 1;
			canUpgrade = (level < 16);
		} else {
			canUpgrade = false;
		}
	}
}
/** todo */
async function updateNode(ns, upgradeThreshold, level) {
	var canUpgrade = true;
	while(canUpgrade) {
		var upgradeCost = await ns.hacknet.getPurchaseNodeCost();
		// ns.tprint(upgradeCost + " " + upgradeThreshold + " " + (upgradeThreshold > upgradeCost));
		if ((upgradeThreshold * 10)> upgradeCost) {
			var currentCash = await ns.getServerMoneyAvailable("home");
			// ns.tprint(upgradeCost + " " + currentCash + " " + (upgradeCost > currentCash));
			while(upgradeCost > currentCash) {
				await ns.sleep(5000);
				currentCash = await ns.getServerMoneyAvailable("home");
			}
			await ns.hacknet.purchaseNode();
			level = level + 1;
			canUpgrade = (level < 24);
		} else {
			canUpgrade = false;
		}
	}
}