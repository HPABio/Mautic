/**
 * Block Selector Module
 * Selects appropriate email blocks based on criteria
 */

import type { EmailBlock, BlockCategory, EmailTone } from '../types/email-composer';
import { promises as fs } from 'fs';
import { join } from 'path';

export class BlockSelector {
  private blocks: Map<string, EmailBlock>;
  private blocksByCategory: Map<BlockCategory, EmailBlock[]>;
  private blocksDir: string;

  constructor(blocksDir?: string) {
    this.blocks = new Map();
    this.blocksByCategory = new Map();
    this.blocksDir = blocksDir || join(process.cwd(), 'src/email-composer/blocks');
  }

  /**
   * Load a block from file or cache
   */
  async loadBlock(blockId: string): Promise<EmailBlock | null> {
    // Check cache first
    if (this.blocks.has(blockId)) {
      return this.blocks.get(blockId)!;
    }

    // Try to load from file
    try {
      const blockPath = join(this.blocksDir, `${blockId}.json`);
      const content = await fs.readFile(blockPath, 'utf-8');
      const block: EmailBlock = JSON.parse(content);

      this.blocks.set(blockId, block);

      // Update category index
      const categoryBlocks = this.blocksByCategory.get(block.category) || [];
      categoryBlocks.push(block);
      this.blocksByCategory.set(block.category, categoryBlocks);

      return block;
    } catch (error) {
      console.warn(`Block not found: ${blockId}`);
      return null;
    }
  }

  /**
   * Load all blocks from a directory
   */
  async loadAllBlocks(): Promise<void> {
    const categories: BlockCategory[] = [
      'greeting',
      'opener',
      'intention',
      'event-info',
      'value-proposition',
      'cta',
      'closing',
    ];

    for (const category of categories) {
      const categoryPath = join(this.blocksDir, category);

      try {
        const files = await fs.readdir(categoryPath);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        for (const file of jsonFiles) {
          const filePath = join(categoryPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const block: EmailBlock = JSON.parse(content);

          this.blocks.set(block.id, block);

          const categoryBlocks = this.blocksByCategory.get(category) || [];
          categoryBlocks.push(block);
          this.blocksByCategory.set(category, categoryBlocks);
        }
      } catch (error) {
        console.warn(`Could not load blocks from category: ${category}`);
      }
    }
  }

  /**
   * Select a block by category and selector (tag, tone, or filename)
   */
  async selectBlock(
    category: BlockCategory,
    selector: string,
    variantId?: string
  ): Promise<{ block: EmailBlock; variant: any } | null> {
    // Try 1: Direct load by filename/id
    let block = await this.loadBlock(`${category}/${selector}`);

    // Try 2: Search by tag
    if (!block) {
      const categoryBlocks = this.blocksByCategory.get(category) || [];
      block = categoryBlocks.find(b => b.tags.includes(selector)) || null;
    }

    // Try 3: Match by tone (for greetings/closings)
    if (!block) {
      const categoryBlocks = this.blocksByCategory.get(category) || [];
      block = categoryBlocks.find(b => b.tone === selector) || null;
    }

    if (!block) {
      console.warn(`No block found for category: ${category}, selector: ${selector}`);
      return null;
    }

    // Select variant
    let variant;
    if (variantId) {
      variant = block.variants.find(v => v.id === variantId);
    }

    if (!variant && block.variants.length > 0) {
      // Default to first variant or random selection
      variant = block.variants[0];
    }

    return variant ? { block, variant } : null;
  }

  /**
   * Get random variant from a block (for A/B testing)
   */
  getRandomVariant(block: EmailBlock): any {
    if (block.variants.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * block.variants.length);
    return block.variants[randomIndex];
  }

  /**
   * Get all blocks by category
   */
  getBlocksByCategory(category: BlockCategory): EmailBlock[] {
    return this.blocksByCategory.get(category) || [];
  }

  /**
   * Search blocks by tags
   */
  searchByTags(tags: string[]): EmailBlock[] {
    const results: EmailBlock[] = [];

    for (const block of this.blocks.values()) {
      const hasAllTags = tags.every(tag => block.tags.includes(tag));
      if (hasAllTags) {
        results.push(block);
      }
    }

    return results;
  }

  /**
   * Get block metadata (without loading full content)
   */
  async getBlockMetadata(blockId: string): Promise<Pick<EmailBlock, 'id' | 'category' | 'tags' | 'tone'> | null> {
    const block = await this.loadBlock(blockId);
    if (!block) return null;

    return {
      id: block.id,
      category: block.category,
      tags: block.tags,
      tone: block.tone,
    };
  }
}

export default BlockSelector;
