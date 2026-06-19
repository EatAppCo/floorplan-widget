const { fabric } = require('fabric');

/**
 * Position of the label relative to the table
 */
export type LabelPosition = 'top' | 'bottom' | 'below_bottom' | 'corner';

/**
 * Options for creating a LabelGroup
 */
export interface LabelGroupOptions extends fabric.IGroupOptions {
  /** ID of the table this label is associated with */
  _relatedTableId: string;
  /** Position of the label relative to the table */
  _positionOnTable?: LabelPosition;
}

/**
 * Custom Fabric.js Group for table labels
 */
class LabelGroup extends fabric.Group {
  /** ID of the table this label is associated with */
  _relatedTableId: string;
  /** Position of the label relative to the table */
  _positionOnTable?: LabelPosition;

  constructor(objects: fabric.Object[], options: LabelGroupOptions) {
    super(objects, options);
    this._relatedTableId = options._relatedTableId;
    this._positionOnTable = options._positionOnTable;
  }
}

export default LabelGroup;
