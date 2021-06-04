import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';
var minimatch = require("minimatch");

export function globLaunch(folder: WorkspaceFolder | undefined, dictionaryOfGlobPatterns: object) {
	if (!vscode.window.activeTextEditor) {
		vscode.window.showInformationMessage('no active file in text editor');
		return;
	}
	if (!folder) {
		vscode.window.showInformationMessage('no active workspaceFolders');
		return;
	}
	var activeFilenameWithPath = vscode.window.activeTextEditor.document.fileName;

	// run the first glob match in the user map
	for (let [globPattern, launchTaskName] of Object.entries(dictionaryOfGlobPatterns)) {
		var matchExists = minimatch(activeFilenameWithPath, globPattern, { matchBase: true });
		if (matchExists) {
			console.log(`matched "${activeFilenameWithPath}" using {"${globPattern}":"${launchTaskName}"}`);
			vscode.debug.startDebugging(folder, launchTaskName);
			return;
		}
	}

	vscode.window.showInformationMessage(`no globs matched current active file: ${activeFilenameWithPath}`);
}

class AutoDebugConfigurationProvider implements vscode.DebugConfigurationProvider {
	resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		// hand off to the appropriate debugger instead of setting one up here
		globLaunch(folder, config.map);

		// cancel this debug session
		return undefined;
	}
}

export function manualGlobLaunch() {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage('no active workspaceFolders (!vscode.workspace.workspaceFolders)');
		return;
	}
	vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], 'auto');
}

export function activate(context: vscode.ExtensionContext) {
	console.log('activated "auto-debug"');

	// register the debug configuration
	const provider = new AutoDebugConfigurationProvider();
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('auto-debug', provider));

	// register a manual command
	let disposable = vscode.commands.registerCommand('auto-debug.auto-debug', manualGlobLaunch);
	context.subscriptions.push(disposable);
}

export function deactivate() { }
