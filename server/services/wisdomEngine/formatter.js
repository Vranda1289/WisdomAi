/**
 * Response Formatter Layer.
 * Normalizes generated text layout before sending it back to the client.
 * 
 * @param {string} text 
 * @returns {string} Formatted response text
 */
export const formatResponse = (text = '') => {
  if (!text) return '';

  let formatted = text.trim();

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');

  // Extract content inside <response>...</response> tags if present
  const responseMatch = formatted.match(/<response>([\s\S]*?)<\/response>/i);
  if (responseMatch && responseMatch[1]) {
    formatted = responseMatch[1].trim();
  } else {
    // If no <response> tags found, strip any thinking and self_review tags to avoid leakage
    formatted = formatted.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    formatted = formatted.replace(/<self_review>[\s\S]*?<\/self_review>/gi, '');
    formatted = formatted.trim();
  }


  // Split content by paragraphs and inspect/restructure long blocks
  const paragraphs = formatted.split('\n\n');
  const processedParagraphs = paragraphs.map(p => {
    const trimmed = p.trim();

    // Preserve code blocks and list structures
    if (trimmed.startsWith('```') || trimmed.includes('```') || trimmed.match(/^[-*+•\d+\.]/)) {
      return trimmed;
    }

    // Split overly long paragraphs at natural sentence boundaries to prevent layout congestion
    if (trimmed.length > 380) {
      const sentences = trimmed.split(/(?<=[.!?])\s+(?=[A-Z])/);
      if (sentences.length > 3) {
        const subParagraphs = [];
        for (let i = 0; i < sentences.length; i += 2) {
          subParagraphs.push(sentences.slice(i, i + 2).join(' '));
        }
        return subParagraphs.join('\n\n');
      }
    }
    return trimmed;
  });

  formatted = processedParagraphs.join('\n\n');

  // Cap consecutive spacing to maximum of a double newline
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Group list items together without wide double newline gaps
  formatted = formatted.replace(/(?<=\n[-*+•]\s.*)\n\n(?=[-*+•]\s)/g, '\n');
  formatted = formatted.replace(/(?<=\n\d+\.\s.*)\n\n(?=\d+\.\s)/g, '\n');

  return formatted;
};
export default formatResponse;
