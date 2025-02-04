const vscode = require('vscode');

const placeholderDecorationType = vscode.window.createTextEditorDecorationType({ color: '#71bbd2' });

/**
 * @param {vscode.TextEditor} editor
 */
function updateDecorations(editor) {
    const text = editor.document.getText();
    const decorations = [];
    const lines = text.split(/\r?\n|\r/);

    let strStartPos;
    let isInsideChar = false;
    let isInsideString = false;
    let isInsideRawString = false;

    const strings = [];

    for (let ln = 0; ln < lines.length; ln++) {
        const line = lines[ln];
        if (line.startsWith('//')) {
            continue;
        }

        for (let col = 0; col < line.length; col++) {
            const char = line[col];
            switch (char) {
                case "'":
                    if (!isInsideChar && !isInsideString && !isInsideRawString) {
                        isInsideChar = true;
                        strStartPos = new vscode.Position(ln, col + 1)
                    } else if (isInsideChar) {
                        isInsideChar = false;
                        const range = new vscode.Range(strStartPos, new vscode.Position(ln, col))
                        strings.push({ range: range, text: editor.document.getText(range), isRaw: false, });
                    }
                    break;
                case '"':
                    if (!isInsideChar && !isInsideString && !isInsideRawString) {
                        isInsideString = true;
                        strStartPos = new vscode.Position(ln, col + 1)
                    } else if (isInsideString && line[col - 1] !== '\\') {
                        isInsideString = false;
                        const range = new vscode.Range(strStartPos, new vscode.Position(ln, col))
                        strings.push({ range: range, text: editor.document.getText(range), isRaw: false, });
                    }
                    break;
                case '`':
                    if (!isInsideChar && !isInsideString && !isInsideRawString) {
                        isInsideRawString = true;
                        strStartPos = new vscode.Position(ln, col + 1)
                    } else if (isInsideRawString) {
                        isInsideRawString = false;
                        const range = new vscode.Range(strStartPos, new vscode.Position(ln, col))
                        strings.push({ range: range, text: editor.document.getText(range), isRaw: true, });
                    }
                    break;
            }
        }
    }

    for (let str of strings) {
        decorations.push(...decorateStrings(str));
    }

    editor.setDecorations(placeholderDecorationType, decorations);
}

/** 
 * @param {{ range: vscode.Range; text: string; isRaw: boolean; }} str
 */
function decorateStrings(str) { // todo: write quality parser
    const decorations = [];
    let match;

    const lines = str.text.split(/\r?\n|\r/);
    let lnOffset = str.range.start.line;
    let colOffset = str.range.start.character;
    for (let ln = 0; ln < lines.length; ln++) {
        const line = lines[ln];
        if (ln > 0) {
            colOffset = 0
        }

        const placeholderRegex = /%%|%[ 0#+-]*\d*\.?\d*[wvTtbcdoOqxXUeEfFgGsp]/g;
        while ((match = placeholderRegex.exec(line)) !== null) {
            const start = new vscode.Position(lnOffset + ln, colOffset + match.index)
            const end = new vscode.Position(lnOffset + ln, colOffset + match.index + match[0].length)
            decorations.push(new vscode.Range(start, end));
        }

        if (str.isRaw) {
            continue
        }

        const escapeSequenceRegex = /\\[abtnfrv\\]|\\x[0-9A-Fa-f]{2}|\\[0-7]{3}|\\u[0-9A-Fa-f]{4}|\\U[0-9A-Fa-f]{8}/g;
        while ((match = escapeSequenceRegex.exec(line)) !== null) {
            const start = new vscode.Position(lnOffset + ln, colOffset + match.index)
            const end = new vscode.Position(lnOffset + ln, colOffset + match.index + match[0].length)
            decorations.push(new vscode.Range(start, end));
        }
    }

    return decorations
}

// todo dirty checking, diff processing
function activate(context) {
    updateDecorations(vscode.window.activeTextEditor)

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'go') {
            updateDecorations(editor);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === event.document && editor.document.languageId === 'go') {
            updateDecorations(editor);
        }
    }, null, context.subscriptions);
}

function deactivate() { }

module.exports = { activate, deactivate };
