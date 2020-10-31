export interface Node<T> {
  value: T;
  children: Node<T>[];
}

export interface SearchableNode<T> extends Node<T> {
  id: string;
  children: SearchableNode<T>[];
}

export interface TreeTableNode<T> extends SearchableNode<T> {
  depth: number;
  isVisible: boolean;
  isExpanded: boolean;
  children: TreeTableNode<T>[];
}

export interface NodeInTree<T> extends SearchableNode<T> {
  pathToRoot: SearchableNode<T>[];
}

export interface CustomColumnOrder<T> {
  key: string & keyof T, title: string, visible?: boolean
}

export interface Options<T> {
  verticalSeparator?: boolean;
  capitalisedHeader?: boolean;
  highlightRowOnHover?: boolean;
  customColumnOrder?: CustomColumnOrder<T>[];
  elevation?: number;
  expanded?: boolean;
}
