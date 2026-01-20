const { fabric } = require('fabric');
import { Table } from '../types';

/**
 * Options for creating a TableGroup
 */
export interface TableGroupOptions extends fabric.IGroupOptions {
  /** The table data associated with this group */
  tableContext: Table;
}

/**
 * Custom Fabric.js Group that holds a table and its associated context data
 */
class TableGroup extends fabric.Group {
  /** The table data associated with this group */
  tableContext: Table;

  constructor(objects: fabric.Object[], options: TableGroupOptions) {
    super(objects, options);
    this.tableContext = options.tableContext;
  }
}

export default TableGroup;
