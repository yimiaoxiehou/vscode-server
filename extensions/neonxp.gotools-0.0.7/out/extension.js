"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorsWrapper = exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fnRegex = /^\t*(.*)err\s?:?=.+?$/;
function activate(context) {
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('go', new ErrorsWrapper(), { providedCodeActionKinds: ErrorsWrapper.providedCodeActionKinds }));
    context.subscriptions.push(vscode.commands.registerCommand('gotools.wrap-error', wrapError));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
class ErrorsWrapper {
    provideCodeActions(document, range) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return undefined;
        }
        const line = document.lineAt(editor.selection.start.line);
        if (!fnRegex.test(line.text)) {
            vscode.commands.executeCommand('setContext', 'allowWrapIferr', false);
            return undefined;
        }
        vscode.commands.executeCommand('setContext', 'allowWrapIferr', true);
        const action = new vscode.CodeAction('Add error checking', vscode.CodeActionKind.RefactorRewrite);
        action.command = { command: 'gotools.wrap-error', title: 'Add error checking block', tooltip: '' };
        return [
            action,
        ];
    }
}
exports.ErrorsWrapper = ErrorsWrapper;
ErrorsWrapper.providedCodeActionKinds = [
    vscode.CodeActionKind.RefactorRewrite
];
const wrapError = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const document = editor.document;
    const line = document.lineAt(editor.selection.start.line);
    const matches = line.text.match(fnRegex);
    if (matches == null || matches.length == 0) {
        return;
    }
    const extravars = matches[1].split(',').map(x => x.trim()).filter(x => x);
    if (extravars.filter(x => x != "_").length > 0) {
        editor.insertSnippet(new vscode.SnippetString(`\nif err != nil {\n\t\${1:return \${2:nil, }\${3:err}}\n}\n`), new vscode.Position(line.range.end.line, line.range.end.character + line.firstNonWhitespaceCharacterIndex));
    }
    else {
        editor.insertSnippet(new vscode.SnippetString(`if `), new vscode.Position(line.range.start.line, line.range.start.character + line.firstNonWhitespaceCharacterIndex));
        editor.insertSnippet(new vscode.SnippetString(`; err != nil {\n\t\${1:return \${2:nil, }\${3:err}}\n}\n`), new vscode.Position(line.range.end.line, line.range.end.character + line.firstNonWhitespaceCharacterIndex + 3), {
            undoStopAfter: true,
            undoStopBefore: false,
        });
    }
};
//# sourceMappingURL=extension.js.map