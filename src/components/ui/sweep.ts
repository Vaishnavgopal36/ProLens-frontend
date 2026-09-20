/**
 * Corner-sweep hover: a circle grows from the bottom-right corner and fills the
 * button. It is a transform-only pseudo-element (no layout or paint work),
 * scales with any button width, only runs where a real hover exists (so touch
 * devices don't get a stuck fill) and is instant for reduced-motion users.
 */
export const SWEEP_BASE =
  "relative isolate overflow-hidden duration-300 before:pointer-events-none before:absolute before:-z-10 before:bottom-0 before:right-0 before:aspect-square before:w-[300%] before:translate-x-1/2 before:translate-y-1/2 before:scale-0 before:rounded-full before:content-[''] before:transition-transform before:duration-[400ms] before:ease-out motion-reduce:before:duration-0 [@media(hover:hover)]:hover:before:scale-100";
