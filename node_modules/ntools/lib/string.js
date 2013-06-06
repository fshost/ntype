function escapeHtml(html) {
    /**
     * Escapes the given string of html.
     * @param {String} html The html string to escape.
     * @returns {String} The escaped html string.
     */
    return String(html)
      .replace(/&(?!\w+;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
}
exports.escapeHtml = escapeHtml;

function unescapeHtml(html) {
    /**
     * Unescapes the given string of html.
     * @param {String} html The html string to unescape.
     * @returns {String} The unescaped html string.
     */
    return String(html)
      .replace(/&(?!\w+;)/g, '&amp;')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
}
exports.unescapeHtml = unescapeHtml;

function removeBOM(text) {
    /**
     * Remove Byte-Order-Mark from beginning of text if present.
     * @param {String} text The text to remove the BOM from.
     * @returns {String} The text after removing the BOM.
     */
    if (text.indexOf('\uFEFF') === 0) {
        text = text.substring(1, text.length);
    }
    return text;
}
exports.removeBOM = removeBOM;

function removeLineBreaks(text) {
    /**
     * Remove new-line and carriage-return characters from text.
     * @param {String} text The text to remove the line-breaks from.
     * @returns {String} The text after removing the line-breaks.
     */
    return text.replace(/(\r\n|\n|\r)/gm, '');
}
exports.removeLineBreaks = removeLineBreaks;

function camelize(str, separator) {
    /**
     * Camelizes a string.
     * @param {String} str The string to camelize.
     * @param {String} separator The character or string the denotes where to camelize.
     * @returns {String} The text after removing the BOM.
     */
    separator = separator || '-';
    var tokens = str.split(separator);
    for (var i = 1, l = tokens.length; i < l; i++) {
        tokens[i] = tokens[i].charAt(0).toUpperCase() + tokens[i].substr(1);
    }
    return tokens.join('');
}
exports.camelize = camelize;