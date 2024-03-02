import { nullQuery } from "@/core";
import { Store } from "@tanstack/store";

import * as O from "@fp-ts/optic";
import { BoundedStore } from "./stores";
import { OrderField, nullSort } from "@/core/sorters";
import {
  IFilter,
  IScalarFilters,
  RangeField,
  isKanbanView,
  nullFilter,
} from "@/core/filters";
import { compose, identity } from "@/utils/functions";
import { isNumberField } from "@/core/note";

export const queryStore = new Store(nullQuery);

const init = {
  filter: nullFilter,
  focusedNote: "",
  sort: nullSort,
};
type State = typeof init;

const bounded = new BoundedStore(init);
const { lens, prism, setter } = bounded.applied();

const o = O.id<State>();
const filter = o.at("filter");
const view = filter.at("view");
const sort = o.at("sort");

function activeField<K extends RangeField>(field: K) {
  const i = O.iso<IScalarFilters[K], boolean>(Boolean, (active) =>
    active ? {} : undefined,
  );
  filter.at("scalars").at(field).compose(i);
}

const sortFieldRaw = sort.at("field");

function aroundSort(entering: boolean) {
  const x = O.iso<State, State>(identity, (s) => {
    const field = O.get(sortFieldRaw)(s);
    if (isNumberField(ac)) return s;
    const ac = activeField(field);
    if (O.get(ac)(s) !== entering) return O.set(ac)(entering)(s);
    return s;
  });
}

const aroundSort_ = (entering: boolean) =>
  o.lens(identity, (s) => {
    const field = O.get(sortFieldRaw)(s);
    const ac = activeField(field);
    if (O.get(ac)(s) !== entering) return O.set(ac)(entering)(s);
    return s;
  });
const sortField = O.compose(aroundSort(true), sortFieldRaw, aroundSort(false));

export const useStr = {
  activeField,
  focusedNote: lens(o.at("focusedNote")),
  focusDir: setter((dir: string) =>
    compose(
      O.set(o.at("focusedNote"))(""),
      O.set(filter)(nullFilter),
      O.set(filter.at("dir"))(tag),
    ),
  ),
  focusTag: setter((tag: string) =>
    compose(
      O.set(o.at("focusedNote"))(""),
      O.set(filter)(nullFilter),
      O.set(filter.at("tags"))([tag]),
    ),
  ),
  sort: {
    id: lens(sort),
    field: lens(sortField),
    asc: lens(sort.at("asc")),
  },
  filter: {
    dir: lens(filter.at("id")),
    tags: lens(filter.at("tags")),
    tag: (tag: string) => lens(filter.at("tags").compose(member(tag))),
    view: {
      id: lens(view),
      type: lens(view.at("type")),
      kanban: prism(view.guard(isKanbanView).at("kanban")),
    },
  },
};
