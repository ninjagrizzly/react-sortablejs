import * as React from "react"
import { function as fn, readonlyRecord as RORC } from "fp-ts"
import Sortable from "sortablejs"

export type UseStatePure<S> = React.Dispatch<fn.Endomorphism<S>>

export type Item = {
  id: string
  chosen: boolean
  selected: boolean
}

export interface UseSortableOptions<A extends Item, R extends HTMLElement> {
  /**
   * @summary
   * This is the same return value as `React.useState()`
   * but the parameter for dispatch is `(state: A[]) => A[]`,
   * where as `React.useState()`'s dispatch parameter can also be `A[]`.
   *
   * We do this so we can create nested sortables,
   * and it's considered best practice for non-primitive values.
   *
   * This must be _memoize_ with react, so use `React.useState()` to create this value.
   */
  state: UseStatePure<A[]>
  /**
   * @summary
   * A react reference to a HTMLElement.
   *
   * We use this to create the sortable element.
   */
  ref?: React.MutableRefObject<R | null>
  /**
   * @summary
   * All options used on the sortable.
   */
  options: Sortable.Options
}

export interface ReturnValue<R extends HTMLElement> {
  ref: NonNullable<React.Ref<R>>
}

// why am i doing this again?
// const optionsDefault: Sortable.Options = {
//   group: null,
//   sort: true,
//   disabled: false,
//   store: null,
//   handle: null,
//   draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
//   swapThreshold: 1,
//   invertSwap: false,
//   invertedSwapThreshold: null,
//   removeCloneOnHide: true,
//   direction: function () {
//     return _detectDirection(el, this.options)
//   },
//   ghostClass: "sortable-ghost",
//   chosenClass: "sortable-chosen",
//   dragClass: "sortable-drag",
//   ignore: "a, img",
//   filter: null,
//   preventOnFilter: true,
//   animation: 0,
//   easing: null,
//   setData: function (dataTransfer, dragEl) {
//     dataTransfer.setData("Text", dragEl.textContent)
//   },
//   dropBubble: false,
//   dragoverBubble: false,
//   dataIdAttr: "data-id",
//   delay: 0,
//   delayOnTouchOnly: false,
//   touchStartThreshold:
//     (Number.parseInt ? Number : window).parseInt(
//       //@ts-ignore
//       window.devicePixelRatio,
//       10
//     ) || 1,
//   forceFallback: false,
//   fallbackClass: "sortable-fallback",
//   fallbackOnBody: false,
//   fallbackTolerance: 0,
//   fallbackOffset: { x: 0, y: 0 },
//   supportPointer:
//     //@ts-ignore
//     Sortable.supportPointer !== false && "PointerEvent" in window,
//   emptyInsertThreshold: 5,
// }
// stay shallow: primities & Functions
// go deeper: structs
// create default options. we can use this later for something else.

type FunctionProperties = Exclude<
  {
    [P in keyof Sortable.Options]: Extract<
      Sortable.Options[P],
      Function
    > extends never
      ? never
      : P
  }[keyof Sortable.Options],
  undefined | null
>

type DeeperProperties = Exclude<
  {
    [P in keyof Sortable.Options]: Extract<
      Sortable.Options[P],
      Record<string, any>
    > extends never
      ? never
      : P
  }[keyof Sortable.Options],
  undefined | null | FunctionProperties
>

type PrimitiveProperties = keyof Omit<
  Sortable.Options,
  FunctionProperties | DeeperProperties
>

type tups = Exclude<
  {
    [P in keyof Sortable.Options]: [P, Sortable.Options[P]]
  }[keyof Sortable.Options],
  undefined
>

export function useOptions(rawOptions: Sortable.Options): Sortable.Options {
  const values = Object.entries(rawOptions) as tups[]

  for (const [property, value] of values) {
    switch (property) {
      // struct
      case "fallbackOffset": {
        const v = value as Sortable.Options["fallbackOffset"]
      }
      case "group":
      case "store":
      case "scroll": {
      }
      default: {
        // if an object, if not a function or primitive
        console.log(`
fallthrough in useoptions: property "${property}" with value "${value}"
this value will not be watched for changes, because we don't know the type
`)
      }
    }
  }

  // return a record with all the options in it.
  // if a user is changing a property (ie animation), it is probably memoized with useState.
  //
  return rawOptions
}

export function useSortable<R extends HTMLElement, A extends Item = never>({
  options: rawOptions,
  ref = React.useRef<R | null>(null),
  state,
}: UseSortableOptions<A, R>): ReturnValue<R> {
  const options = useOptions(rawOptions)

  const memoizedWithChanges = React.useMemo(() => {}, [])

  // when options change, change options in sortable
  // what about handlers?
  // options object itself is not memoized
  React.useEffect(() => {}, [])

  const sortable = React.useMemo(() => {
    if (ref.current !== null) {
      return Sortable.get(ref.current)
    } else {
      return null
    }
  }, [ref.current])

  // create and mount sortable.
  React.useEffect(() => {
    if (ref.current !== null) {
      Sortable.create(ref.current, options)
    }

    return () => {
      sortable?.destroy()
    }
  }, [sortable])

  return { ref }
}
