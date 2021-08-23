import * as vscode from 'vscode';

function exchangePointAndMark() {
	const editor = vscode.window.activeTextEditor;
	if (editor && !editor.selection.isEmpty) {
		const end: vscode.Position = editor.selection.end;
		const start: vscode.Position = editor.selection.start;
		const position: vscode.Position = editor.selection.active;
		if (start === position) {
			editor.selection = new vscode.Selection(start, end);
		} else {
			editor.selection = new vscode.Selection(end, start);
		}
	}	
}

function message(msg: string) {
	vscode.window.showInformationMessage(msg);
}

function getEditor(): vscode.TextEditor | undefined {
	return vscode.window.activeTextEditor;
}

function getCursor(): vscode.Position | undefined {
	return vscode.window.activeTextEditor?.selection.active;
}

/**
 * Return the character following point, as a string.
 */
function followingChar(): string {
	const cursorPos: vscode.Position | undefined = getCursor();
	if (cursorPos) {
		const charNumber = cursorPos?.character;
		const textLine = getEditor()?.document.lineAt(cursorPos).text;
		if (textLine) {
			return textLine.substr(charNumber, 1);
		}		
	}
	return "";
}

/**
 * Return the character preceding point, as a string.
 */
function precedingChar(): string {
	const cursorPos: vscode.Position | undefined = getCursor();
	if (cursorPos) {
		const charNumber = cursorPos?.character;
		const textLine = getEditor()?.document.lineAt(cursorPos).text;
		if (textLine && charNumber > 0) {
			return textLine.substr(charNumber - 1, 1);
		}
	}
	return "";
}

/**
 * 
 * @param select 
 */			  
function navigateSexp(select: Boolean, forward: boolean) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const selection = editor.selection;
		var selectionStart: vscode.Position;
		if (selection?.end.isBefore(selection?.start)) {
			if (forward) {
				selectionStart = selection?.end;
			} else {
				selectionStart = selection?.start;
			}
		} else {
			if (forward) {
				selectionStart = selection?.start;
			} else {
				selectionStart = selection?.end;
			}
		}
		const setSelection = () => {
			const cursor = getCursor();
			if (select && cursor) {
				if (selection.isEmpty) {
					editor.selection = 
						new vscode.Selection(selection.active, cursor);
				} else {
					editor.selection = 
						new vscode.Selection(selectionStart, cursor);
				}
			}
		};
		var brackets: string[];
		var navCharCmd: string | undefined;
		var navWordCmd: string;
		var charNearTo: string;
		if (forward) {
			brackets =  ["(", "[", "{"];
			charNearTo = followingChar();
			navCharCmd = "cursorRight";
			navWordCmd = "cursorWordRight";
		} else {
			brackets =  [")", "]", "}"];
			charNearTo = precedingChar();
			// navCharCmd = "";
			navWordCmd = "cursorWordLeft";
		}
		if (brackets.includes(charNearTo)) {
			editor.selection = 
				new vscode.Selection(selection.active, selection.active);
			vscode.commands
				.executeCommand("editor.action.jumpToBracket")
				.then(() => {
					if (navCharCmd) {
					vscode.commands
						.executeCommand(navCharCmd)
						.then(setSelection);
					} else {
						setSelection();
					}
				});
		} else {
			vscode.commands
				.executeCommand(navWordCmd)
				.then(setSelection);
		}
	}
}

function forwardSexp(select: Boolean) {
	navigateSexp(select, true);
}

function backwardSexp(select: Boolean) {
	navigateSexp(select, false);
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand(
		'advanced-navigation.exchangePointAndMark', exchangePointAndMark));
	context.subscriptions.push(vscode.commands.registerCommand(
		'advanced-navigation.forwardSexp', () => forwardSexp(false)));
	context.subscriptions.push(vscode.commands.registerCommand(
		'advanced-navigation.forwardSexpSelect', () => forwardSexp(true)));
	context.subscriptions.push(vscode.commands.registerCommand(
		'advanced-navigation.backwardSexp', () => backwardSexp(false)));
	context.subscriptions.push(vscode.commands.registerCommand(
		'advanced-navigation.backwardSexpSelect', () => backwardSexp(true)));		
}

export function deactivate() {}
