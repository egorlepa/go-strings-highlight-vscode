const vscode = require('vscode');


async function findStringLiterals(editor) {
  if (!editor) throw new Error('No active editor.');
  const doc = editor.document;

  try {
    const uri = doc.uri;
    /** @type {{tokenTypes: string[], tokenModifiers: string[]}|undefined} */
    const legend = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri);
    /** @type {{ data: Uint32Array | number[] }|undefined} */
    const sem = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', uri);

    if (legend && sem && sem.data && legend.tokenTypes) {
      const items = decodeStringTokens(doc, legend.tokenTypes, sem.data);
      const merged = mergeAcrossNewlines(doc, items);
      const expanded = merged.map(run => expandToDelimiters(doc, run));
      return expanded.map(run => ({
        range: new vscode.Range(doc.positionAt(run.start), doc.positionAt(run.end)),
        text: doc.getText(new vscode.Range(doc.positionAt(run.start), doc.positionAt(run.end))),
        isRaw: run.isRaw
      }));
    }
  } catch (err) {
    // ⛔️ Show popup with details and stop
    await vscode.window.showErrorMessage(
      `Could not obtain semantic tokens for strings: ${err && err.message ? err.message : String(err)}`
    );
    return [];
  }

  return [];
}

/** Decode semantic tokens and return string token spans as absolute offsets. */
function decodeStringTokens(doc, tokenTypes, rawData) {
  const data = rawData instanceof Uint32Array ? rawData : new Uint32Array(rawData);
  /** @type {Array<{start:number,end:number}>} */
  const spans = [];

  let line = 0;
  let char = 0;

  for (let i = 0; i < data.length; i += 5) {
    const deltaLine = data[i + 0];
    const deltaStart = data[i + 1];
    const length = data[i + 2];
    const tokenTypeIdx = data[i + 3];
    // const tokenMods = data[i + 4];

    if (deltaLine === 0) {
      char += deltaStart;
    } else {
      line += deltaLine;
      char = deltaStart;
    }

    const tokenType = tokenTypes[tokenTypeIdx];
    if (tokenType !== 'string' && tokenType !== 'number') continue;

    const startPos = new vscode.Position(line, char);
    const endPos = new vscode.Position(line, char + length);
    const start = doc.offsetAt(startPos);
    const end = doc.offsetAt(endPos);
    spans.push({ start, end }); // note: per-line spans for raw strings
  }

  // sort by start just in case
  spans.sort((a, b) => a.start - b.start);
  return spans;
}

/** Merge adjacent string spans when the gap between them is only newlines. */
function mergeAcrossNewlines(doc, spans) {
  if (spans.length === 0) return [];

  /** @type {Array<{start:number,end:number}>} */
  const runs = [];
  let cur = { start: spans[0].start, end: spans[0].end };

  for (let i = 1; i < spans.length; i++) {
    const s = spans[i];
    const between = doc.getText(new vscode.Range(
      doc.positionAt(cur.end),
      doc.positionAt(s.start)
    ));

    // If between text is only \r or \n, it's the *same literal* (raw string split across lines)
    if (/^[\r\n]*$/.test(between)) {
      cur.end = s.end; // extend current run
    } else {
      runs.push(cur);
      cur = { start: s.start, end: s.end };
    }
  }
  runs.push(cur);
  return runs;
}

/** Expand a run to include surrounding delimiters and decide if it's raw (`...`). */
function expandToDelimiters(doc, run) {
  let { start, end } = run;

  const left = charAt(doc, start - 1);
  const right = charAt(doc, end);

  // Include opening delimiter if present
  if (left === '"' || left === '`') start -= 1;
  // Include closing delimiter if present and matches opening (if any)
  if (right === '"' || right === '`') end += 1;

  const text = doc.getText(new vscode.Range(doc.positionAt(start), doc.positionAt(end)));
  const isRaw = text.startsWith('`') && text.endsWith('`');

  return { start, end, isRaw };
}

/** Safe single char read at offset. */
function charAt(doc, offset) {
  if (offset < 0) return '';
  const start = doc.positionAt(offset);
  const end = doc.positionAt(offset + 1);
  if (start.isEqual(end)) return '';
  return doc.getText(new vscode.Range(start, end));
}

module.exports = findStringLiterals;
