import { nullQuery } from "@/core";
import { Store } from "@tanstack/store";

import * as O from "optics-ts";
import { BoundedStore } from "./stores";
import { OrderField, nullSort } from "@/core/sorters";
import { isKanbanView, nullFilter } from "@/core/filters";
import { compose, identity } from "@/utils/functions";

export const queryStore = new Store(nullQuery);

const init = {
  filter: nullFilter,
  focusedNote: "",
  sort: nullSort,
};
type State = typeof init;

const bounded = new BoundedStore(init);
const { lens, prism, setter } = bounded.applied();

const o = O.optic<State>();
const filter = o.prop("filter");
const view = filter.prop("view");
const sort = o.prop("sort");

const sortFieldRaw = sort.prop("field");
const activeField = (field: OrderField) =>
  filter.prop(field).iso(Boolean, (active) => (active ? {} : undefined));
const aroundSort = (entering: boolean) =>
  o.lens(identity, (s) => {
    const field = O.get(sortFieldRaw)(s);
    const ac = activeField(field);
    if (O.get(ac)(s) !== entering) return O.set(ac)(entering)(s);
    return s;
  });
const sortField = O.compose(aroundSort(true), sortFieldRaw, aroundSort(false));

export const useStr = {
  activeField,
  focusedNote: lens(o.prop("focusedNote")),
  focusDir: setter((dir: string) =>
    compose(
      O.set(o.prop("focusedNote"))(""),
      O.set(filter)(nullFilter),
      O.set(filter.prop("dir"))(tag),
    ),
  ),
  focusTag: setter((tag: string) =>
    compose(
      O.set(o.prop("focusedNote"))(""),
      O.set(filter)(nullFilter),
      O.set(filter.prop("tags"))([tag]),
    ),
  ),
  sort: {
    id: lens(sort),
    field: lens(sortField),
    asc: lens(sort.prop("asc")),
  },
  filter: {
    dir: lens(filter.prop("id")),
    tags: lens(filter.prop("tags")),
    tag: (tag: string) => lens(filter.prop("tags").compose(member(tag))),
    view: {
      id: lens(view),
      type: lens(view.prop("type")),
      kanban: prism(view.guard(isKanbanView).prop("kanban")),
    },
  },
};
