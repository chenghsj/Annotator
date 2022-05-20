/**
 * @param {object} args
 * @param {HTMLElement} args.node
 * @param {string} args.type
 * @returns {boolean}
 */
function detectNodeType({ node, type }) {
  while (node.parentNode) {
    if (node.tagName === type) return true;
    node = node.parentNode;
  }
  return false;
}

export { detectNodeType };
