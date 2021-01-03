/*---------------------------------------------------------
 * Copyright (C) shinriyo. All rights reserved.
 *--------------------------------------------------------*/

/** To demonstrate code actions associated with Diagnostics problems, this file provides a mock diagnostics entries. */

import * as vscode from 'vscode';
// import * as semverRegex from 'semver-regex';

/** Code that is used to associate diagnostic entries with code actions. */
export const EMOJI_MENTION = 'emoji_mention';
const semverRegex = require('semver-regex');

/** String to detect in the text document. */
// const EMOJI = 'emoji';

/**
 * Analyzes the text document for problems. 
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param emojiDiagnostics diagnostic collection
 */
export function refreshDiagnostics(doc: vscode.TextDocument, emojiDiagnostics: vscode.DiagnosticCollection): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);

		// TODO:
		// ^1.0.6 const re = RegExp(' []');
		const splited = lineOfText.text.split(": ")
		if (splited.length != 2) {
			continue;
		}

		// semverRegex can't check ^, so removed.
		const ok = semverRegex().test(splited[1].replace("^", ""));
		// if (lineOfText.text.includes(EMOJI)) {
		// if (lineOfText.text.includes("^1.0.6")) {
		if (ok) {
			diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex));
		}
	}

	emojiDiagnostics.set(doc.uri, diagnostics);
}

function createDiagnostic(doc: vscode.TextDocument, lineOfText: vscode.TextLine, lineIndex: number): vscode.Diagnostic {
	const point = lineOfText.text.split(": ")[1]

	// find where in the line of thet the 'emoji' is mentioned
	// const index = lineOfText.text.indexOf(EMOJI);
	const index = lineOfText.text.indexOf(point);

	// create range that represents, where in the document the word is
	// const range = new vscode.Range(lineIndex, index, lineIndex, index + EMOJI.length);
	const range = new vscode.Range(lineIndex, index, lineIndex, index + point.length);

	const diagnostic = new vscode.Diagnostic(range, "Do you want to get latest version?",
		vscode.DiagnosticSeverity.Information);
	diagnostic.code = EMOJI_MENTION;
	return diagnostic;
}

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, emojiDiagnostics: vscode.DiagnosticCollection): void {
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, emojiDiagnostics);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, emojiDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, emojiDiagnostics))
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => emojiDiagnostics.delete(doc.uri))
	);

}