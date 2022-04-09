/ @param {NS} ns /
export async function main(ns) {

    ns.disableLog('getServerRequiredHackingLevel')
    ns.disableLog('getHackingLevel')
    ns.disableLog('sleep')

    // parse args
    const targetServer = ns.args[0]

    var openPortsRequired = ns.getServerNumPortsRequired(targetServer)
    var requiredHackingLevel = ns.getServerRequiredHackingLevel(targetServer)
    var portScripts = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe']
    var numberOfPortScripts = portScripts.length
    var numberOfOpenPorts = 0;

    while (ns.hasRootAccess(targetServer) === false) {

        var hackingLevel = ns.getHackingLevel()

        portScripts = openPorts(ns, targetServer, portScripts)
        numberOfOpenPorts = numberOfPortScripts - portScripts.length;

        if (numberOfOpenPorts >= openPortsRequired && hackingLevel >= requiredHackingLevel) {

            await ns.nuke(targetServer)
        }

        if (ns.hasRootAccess(targetServer)) {

            startScript(ns, 'root-access-attack.js', 'home', targetServer, 1)
            ns.print('Root access on ' + targetServer)
            break
        } else {

            ns.print('Attack attempted on ' + targetServer)
            ns.print('Required hacking level: ' + requiredHackingLevel + ' | Current hacking level: ' + hackingLevel)
            ns.print('Required number of open ports: ' + openPortsRequired + ' | Current number of open ports: ' + numberOfOpenPorts)
            ns.print('')
        }

        await ns.sleep(1000)
    }
}

function openPorts(ns, targetServer, portScripts) {

    var newPortScripts = portScripts;

    for (var i = 0; i < portScripts.length; i++) {

        if (ns.fileExists(portScripts[i], 'home')) {

            if ('BruteSSH.exe' === portScripts[i]) {
                ns.brutessh(targetServer)
                newPortScripts = newPortScripts.filter(e => e !== portScripts[i])
            }
            else if ('FTPCrack.exe' === portScripts[i]) {
                ns.ftpcrack(targetServer)
                newPortScripts = newPortScripts.filter(e => e !== portScripts[i])
            }
            else if ('relaySMTP.exe' === portScripts[i]) {
                ns.relaysmtp(targetServer)
                newPortScripts = newPortScripts.filter(e => e !== portScripts[i])
            }
        }
    }

    return newPortScripts;
}

function startScript(ns, script, hostServer, targetServer, threads) {
    ns.exec(script, hostServer, threads, targetServer)
}