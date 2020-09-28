import * as React from "react"
import { Options } from "sortablejs"
import { Item, useSortable, UseSortableOptions } from "./use-sortable"

export type HTMLSVGElementTagMap = HTMLElementTagNameMap & SVGElementTagNameMap

/**
 * @todo render function. arguments in. should be able to add a styled component in it.
 */
export type ReactSortableProps<A extends Item> = Options &
  Pick<UseSortableOptions<A, HTMLElement>, "state"> & {
    className?: string
    style?: React.CSSProperties
  } & {
    tag: keyof HTMLSVGElementTagMap
  }

export type ExoticRef<T> =
  | ((instance: T | null) => void)
  | React.MutableRefObject<T | null>
  | null

/**
 * @todo
 * use a generic on the element type from the tag so
 * extra attributes can be added.
 */
export const ReactSortable = React.forwardRef(
  <A extends Item, R extends HTMLElement>(
    props: React.PropsWithChildren<ReactSortableProps<A>>,
    refExternal: ExoticRef<R>
  ) => {
    const { tag, state, className, style, children, ...options } = props

    const refInternal = React.useRef<R | null>(null)
    useSortable({ ref: refInternal, options, state })

    return React.createElement(tag, {
      children,
      className,
      style,
      ref: (instance: R | null) => {
        if (typeof refExternal === "function") {
          refExternal(instance)
        } else if (refExternal !== null) {
          refExternal.current = instance
        }

        refInternal.current = instance
      },
    })
  }
)
