import { Injectable } from "@angular/core";
import { Node } from "../../models";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  constructor() {}

  search<T>(
    nodes: any,
    query: string,
    key: string,
    fCompare?: (
      node: Node<T> & { value: { [k: string]: any } },
      key: string,
      query: string
    ) => boolean
  ): Node<T> | Node<T>[] {
    const result = [];
    for (const node of nodes) {
      fCompare = fCompare
        ? fCompare
        : (node, key, query) => node.value[key] === query;
      if (fCompare(node, key, query)) {
        result.push(node);
      } else {
        if (node.children && node.children.length) {
          let leaves = this.search(node.children, query, key, fCompare);
          leaves = Array.isArray(leaves) ? leaves : [leaves];
          if (leaves && leaves.length) {
            result.push(Object.assign({}, node, { children: leaves }));
          }
        }
      }
    }
    return result;
  }

  fuzzySearch<T>(nodes: any, query: string): Node<T> | Node<T>[] {
    const result:  Node<T> | Node<T>[] = [];
    for (const node of nodes) {
      console.log(node);
    }
    return result;
  }
}
