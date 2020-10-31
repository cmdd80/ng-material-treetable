import {
  Component,
  OnInit,
  Input,
  Output,
  ElementRef,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from "@angular/core";
import {
  Node,
  TreeTableNode,
  Options,
  SearchableNode,
  CustomColumnOrder,
} from "../models";
import { TreeService } from "../services/tree/tree.service";
import { MatTableDataSource } from "@angular/material";
import { ValidatorService } from "../services/validator/validator.service";
import { ConverterService } from "../services/converter/converter.service";
import { defaultOptions } from "../default.options";
import { flatMap, defaults } from "lodash-es";
import { Required } from "../decorators/required.decorator";
import { Subject } from "rxjs";
import { FilterService } from "../services/filter/filter.service";

@Component({
  selector: "ng-treetable, treetable", // 'ng-treetable' is currently being deprecated
  templateUrl: "./treetable.component.html",
  styleUrls: ["./treetable.component.scss"],
})
export class TreetableComponent<T> implements OnInit, OnChanges {
  @Input() @Required tree: Node<T> | Node<T>[];

  @Input() options: Options<T> = {};
  @Output() nodeClicked: Subject<TreeTableNode<T>> = new Subject();
  @Output() rowClicked = new EventEmitter();

  private originalTree: Node<T> | Node<T>[];
  private searchableTree: SearchableNode<T>[];
  private treeTable: TreeTableNode<T>[];
  displayedColumns: CustomColumnOrder<T>[];
  displayedColumnsKeys: string[];
  dataSource: MatTableDataSource<TreeTableNode<T>>;

  constructor(
    private treeService: TreeService,
    private validatorService: ValidatorService,
    private converterService: ConverterService,
    private filterService: FilterService,
    private cd: ChangeDetectorRef,
    elem: ElementRef
  ) {
    const tagName = elem.nativeElement.tagName.toLowerCase();
    if (tagName === "ng-treetable") {
      console.warn(
        `DEPRECATION WARNING: \n The 'ng-treetable' selector is being deprecated. Please use the new 'treetable' selector`
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tree.isFirstChange()) {
      return;
    }

    this._onChange();
  }

  ngOnInit() {
    this.tree = Array.isArray(this.tree) ? this.tree : [this.tree];
    this.originalTree = JSON.parse(JSON.stringify(this.tree)); // copia per VALORE
    this.options = this.parseOptions(defaultOptions);

    const customOrderValidator = this.validatorService.validateCustomOrder(
      this.tree[0],
      this.options.customColumnOrder.map((column) => column.key)
    );

    if (this.options.customColumnOrder.length && !customOrderValidator.valid) {
      throw new Error(`
        Properties ${customOrderValidator.xor
          .map((x) => `'${x}'`)
          .join(", ")} incorrect or missing in customColumnOrder`);
    }

    if (this.options.customColumnOrder.length) {
      this.displayedColumns = this.options.customColumnOrder;
      this.displayedColumnsKeys = this.options.customColumnOrder.map(
        (column) => column.key
      );
    } else {
      const props = this.extractNodeProps(this.tree[0]);
      this.displayedColumns = props.map((prop) => ({
        key: prop,
        title: prop,
      })) as CustomColumnOrder<T>[];
      this.displayedColumnsKeys = props;
    }

    this.searchableTree = this.tree.map((t) =>
      this.converterService.toSearchableTree(t)
    );
    const treeTableTree = this.searchableTree.map((st) =>
      this.converterService.toTreeTableTree(st)
    );
    this.treeTable = flatMap(treeTableTree, this.treeService.flatten);

    if (!this.options.expanded) {
      this.collapseAll();
    }

    this.dataSource = this.generateDataSource();
  }

  extractNodeProps(tree: Node<T> & { value: { [k: string]: any } }): string[] {
    return Object.keys(tree.value).filter(
      (x) => typeof tree.value[x] !== "object"
    );
  }

  generateDataSource(): MatTableDataSource<TreeTableNode<T>> {
    return new MatTableDataSource(this.treeTable.filter((x) => x.isVisible));
  }

  formatIndentation(node: TreeTableNode<T>, step: number = 5): string {
    return "&nbsp;".repeat(node.depth * step);
  }

  formatElevation(): string {
    return `mat-elevation-z${this.options.elevation}`;
  }

  onNodeClick(clickedNode: TreeTableNode<T>, $event: Event): void {
    $event.stopPropagation();
    clickedNode.isExpanded = !clickedNode.isExpanded;
    this.treeTable.forEach((el) => {
      el.isVisible = this.searchableTree.every((st) => {
        return this.treeService
          .searchById(st, el.id)
          .fold([], (n) => n.pathToRoot)
          .every((p) => this.treeTable.find((x) => x.id === p.id).isExpanded);
      });
    });
    this.dataSource = this.generateDataSource();
    this.nodeClicked.next(clickedNode);
  }

  allElementsVisible(): boolean {
    return this.treeTable.slice(1).every((item) => item.isVisible);
  }

  // Overrides default options with those specified by the user
  parseOptions(defaultOpts: Options<T>): Options<T> {
    return defaults(this.options, defaultOpts);
  }

  onRowClicked(node: Node<T>): void {
    this.rowClicked.emit(node.value);
  }

  toggleAll() {
    if (!this.allElementsVisible()) {
      this.expandAll();
    } else {
      this.collapseAll();
    }
    this.dataSource = this.generateDataSource();
  }

  expandAll() {
    this.treeTable.forEach((item) => {
      item.isExpanded = true;
      item.isVisible = true;
    });
  }

  collapseAll() {
    this.treeTable.forEach((item, index) => {
      item.isExpanded = false;
      if (item.depth > 0) {
        item.isVisible = false;
      }
    });
  }

  _onChange(): void {
    this.tree = Array.isArray(this.tree) ? this.tree : [this.tree];

    this.searchableTree = this.tree.map((t) =>
      this.converterService.toSearchableTree(t)
    );
    const treeTableTree = this.searchableTree.map((st) =>
      this.converterService.toTreeTableTree(st)
    );
    this.treeTable = flatMap(treeTableTree, this.treeService.flatten);
    this.dataSource = this.generateDataSource();
  }

  public filterData(
    query: string,
    key: string,
    fCompare?: (node: Node<T>, key: string, query: string) => boolean
  ) {
    if (query === "") {
      this.tree = this.originalTree;
    } else {
      const result =
        this.filterService.search(this.originalTree, query, key, fCompare) ||
        [];
      this.tree = result;
    }
    this._onChange();
    this.expandAll();
  }

  public filterArrayData(options: {
    query: string;
    filteredNodes: T[];
    originalNodes: T[];
    type?: (string & "DESCENDANTS"| "ANCESTORS" | "ALL");
  }) : T[] | null {
    let { query, filteredNodes, originalNodes, type = "ALL" } = options;
    if (query === "") {
      this.tree = this.originalTree;
      this._onChange();
      this.expandAll();
      return null;
    } else {
      return this.rebuildHierarchy(filteredNodes, originalNodes, type);
    }
  }

  public rebuildHierarchy<T>(
    filteredNodes: T[],
    originalNodes: T[],
    type: (string & "DESCENDANTS") | "ANCESTORS" | "ALL"
  ): T[] {
    switch (type) {
      case "DESCENDANTS":
        return this.filterService.descendants(filteredNodes, originalNodes);
      case "ANCESTORS":
        return this.filterService.ancestors(filteredNodes, originalNodes);
      case "ALL":
      default:
        return this.filterService.all(filteredNodes, originalNodes);
    }
  }
}
