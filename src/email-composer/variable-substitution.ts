/**
 * Variable Substitution Module
 * Replaces {{placeholder}} patterns with actual values
 */

import type { SubstitutionOptions } from '../types/email-composer';

export class VariableSubstitution {
  /**
   * Extract all placeholder variable names from text
   */
  extractPlaceholders(text: string): string[] {
    const pattern = /\{\{(\w+)\}\}/g;
    const matches: string[] = [];
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }

    return matches;
  }

  /**
   * Substitute variables in text with provided values
   */
  substitute(
    text: string,
    variables: Record<string, any>,
    options: SubstitutionOptions = {}
  ): string {
    const { strict = false, keepPlaceholders = false, warnOnMissing = true } = options;
    const pattern = /\{\{(\w+)\}\}/g;

    return text.replace(pattern, (match, varName) => {
      if (variables.hasOwnProperty(varName)) {
        const value = variables[varName];
        return value !== null && value !== undefined ? String(value) : '';
      }

      // Variable not found
      if (strict) {
        throw new Error(`Missing required variable: ${varName}`);
      }

      if (warnOnMissing) {
        console.warn(`Variable not found: ${varName}`);
      }

      return keepPlaceholders ? match : '';
    });
  }

  /**
   * Validate that all placeholders in text have corresponding variables
   */
  validate(text: string, variables: Record<string, any>): {
    valid: boolean;
    missing: string[];
  } {
    const placeholders = this.extractPlaceholders(text);
    const missing = placeholders.filter(p => !variables.hasOwnProperty(p));

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Substitute variables in multiple text blocks
   */
  substituteBatch(
    texts: string[],
    variables: Record<string, any>,
    options: SubstitutionOptions = {}
  ): string[] {
    return texts.map(text => this.substitute(text, variables, options));
  }
}

export default VariableSubstitution;
