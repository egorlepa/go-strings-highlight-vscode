const vscode = require('vscode');
const findStringLiterals = require('./find_strings.js');

let currentPlaceholderDecorationType;
let currentEscapeSequenceDecorationType;

function clearDecorations() {
  if (currentPlaceholderDecorationType) currentPlaceholderDecorationType.dispose();
  if (currentEscapeSequenceDecorationType) currentEscapeSequenceDecorationType.dispose();
}

/**
 * @param {vscode.TextEditor} editor
 */
async function updateDecorations(editor) {
  const strings = await findStringLiterals(editor);

  const placeholderRanges = [];
  const escapeSequenceRanges = [];
  for (let str of strings) {
    const ranges = findDecorationRanges(str)
    placeholderRanges.push(...ranges.placeholderRanges)
    escapeSequenceRanges.push(...ranges.escapeSequenceRanges)
  }

  clearDecorations();

  const placeholderColor = vscode.workspace.getConfiguration().get('go-strings-highlight.colors.placeholderColor');
  const placeholderDecorationType = vscode.window.createTextEditorDecorationType({ color: placeholderColor });
  currentPlaceholderDecorationType = placeholderDecorationType
  editor.setDecorations(placeholderDecorationType, placeholderRanges);

  const escapeSeqColor = vscode.workspace.getConfiguration().get('go-strings-highlight.colors.escapeSequenceColor');
  const escapeSeqDecorationType = vscode.window.createTextEditorDecorationType({ color: escapeSeqColor });
  currentEscapeSequenceDecorationType = escapeSeqDecorationType
  editor.setDecorations(escapeSeqDecorationType, escapeSequenceRanges);

}

/** 
 * @param {{ range: vscode.Range; text: string; isRaw: boolean; }} str
 */
function findDecorationRanges(str) {
  const placeholderRanges = [];
  const escapeSequenceRanges = [];
  let match;

  const lines = str.text.split(/\r?\n|\r/);
  let lnOffset = str.range.start.line;
  let colOffset = str.range.start.character;
  for (let ln = 0; ln < lines.length; ln++) {
    const line = lines[ln];
    if (ln > 0) {
      colOffset = 0;
    }

    const placeholderRegex = /%%|%[ 0#+-]*\d*\.?\d*[wvTtbcdoOqxXUeEfFgGsp]/g;
    while ((match = placeholderRegex.exec(line)) !== null) {
      const start = new vscode.Position(lnOffset + ln, colOffset + match.index);
      const end = new vscode.Position(lnOffset + ln, colOffset + match.index + match[0].length);
      placeholderRanges.push(new vscode.Range(start, end));
    }

    if (str.isRaw) {
      continue;
    }

    const escapeSequenceRegex = /\\[abtnfrv\\]|\\x[0-9A-Fa-f]{2}|\\[0-7]{3}|\\u[0-9A-Fa-f]{4}|\\U[0-9A-Fa-f]{8}/g;
    while ((match = escapeSequenceRegex.exec(line)) !== null) {
      const start = new vscode.Position(lnOffset + ln, colOffset + match.index);
      const end = new vscode.Position(lnOffset + ln, colOffset + match.index + match[0].length);
      escapeSequenceRanges.push(new vscode.Range(start, end));
    }
  }

  return { placeholderRanges, escapeSequenceRanges };
}

const debounceThrottleInterval = 200;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const activeEditor = vscode.window.activeTextEditor
  if (activeEditor && activeEditor.document.languageId === 'go') {
    updateDecorations(activeEditor);
  }

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor && editor.document.languageId === 'go') {
      updateDecorations(editor);
    }
  }, null, context.subscriptions);

  let decorationTimeout;
  let lastDecorationCall = 0;
  vscode.workspace.onDidChangeTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document !== event.document || editor.document.languageId !== 'go') return;

    const now = Date.now();
    const timeSinceLastCall = now - lastDecorationCall;

    clearTimeout(decorationTimeout);

    if (timeSinceLastCall >= debounceThrottleInterval) {
      lastDecorationCall = now;
      updateDecorations(editor);
      return;
    }

    decorationTimeout = setTimeout(() => {
      updateDecorations(editor);
      lastDecorationCall = Date.now();
    }, debounceThrottleInterval - timeSinceLastCall);
  }, null, context.subscriptions);

  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('go-strings-highlight.colors')) {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === 'go') {
        updateDecorations(editor);
      }
    }
  }, null, context.subscriptions);
}

function deactivate() { }

module.exports = { activate, deactivate };
