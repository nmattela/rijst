import { Accessor, createState } from "ags"

export default function sequence<M extends { [K: string]: any }>(accessors: { [K in keyof M]: Accessor<M[K]> }): Accessor<M> {
    const [accessor, setAccessor] = createState<M>(Object.fromEntries(Object.entries(accessors).map(([key, val]: [keyof M, Accessor<M[keyof M]>]) => [key, val.get()])) as M)
    Object.entries(accessors).forEach(([key, val]: [keyof M, Accessor<M[keyof M]>]) => val.subscribe(() => setAccessor(accessor => ({ ...accessor, [key]: val.get() }))))
    return accessor
}