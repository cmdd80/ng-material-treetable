import { Injectable } from "@angular/core";
import { Node } from "../../models";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  constructor() {}

  ancestors<T>(filteredNodes: any, originalNodes: T[]): T[] {
    for (const node of filteredNodes) {
      if (
        filteredNodes.filter(
          (el: { [k: string]: any }) => node.parent === el.id
        ).length === 0
      ) {
        let parent = originalNodes.find(
          (el: { [k: string]: any }) => node.parent === el.id
        );
        if (parent) {
          filteredNodes.push(parent);
          this.ancestors(filteredNodes, originalNodes);
        }
      }
    }
    return filteredNodes;
  }

  descendants<T>(
    filteredNodes: any,
    originalNodes: T[],
    isStandalone: boolean = true
  ): T[] {
    for (const node of filteredNodes) {
      if (
        filteredNodes.filter(
          (el: { [k: string]: any }) => node.id === el.parent
        ).length === 0
      ) {
        let descendants = originalNodes.filter(
          (el: { [k: string]: any }) => node.id === el.parent
        );
        descendants = Array.isArray(descendants) ? descendants : [descendants];
        if (descendants.length) {
          descendants.forEach((descendant: { [k: string]: any }) => {
            if (
              !filteredNodes.find(
                (node: { [k: string]: any }) => node.id === descendant.id
              )
            ) {
              filteredNodes.push(descendant);
            }
          });
        }
      }
    }

    if (isStandalone) {
      filteredNodes[0].parent = 0;
    }
    return filteredNodes;
  }

  all<T>(filteredNodes: T[], originalNodes: T[]): T[] {
    const ancestors = this.ancestors([...filteredNodes] as any, originalNodes);
    const descendants = this.descendants(
      [...filteredNodes] as any,
      originalNodes,
      false
    );
    return [...ancestors, ...descendants].filter(
      (v: { [k: string]: any }, i, a) =>
        a.findIndex((t: { [k: string]: any }) => t.id === v.id) === i //Rimuove i duplicati
    );
  }

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
}
