# core.js, known rough edges (found 2026-11-11 while writing acting.js)

Fixed already: per-figure default blink/breath seed; `shade()` now accepts rgb() and 3-digit hex;
a comment on the leg-angle sign trap and on `bob` disabling the idle breath.

Still open — each is additive and safe to do between daily runs:
1. `o.blink` is documented but never read. `head()` hardcodes `((t*0.8 + seed) % 3.3) < 0.12`.
   acting.js has to solve for a seed to place a blink. The rig should take a blink input directly.
2. `o.talk` is a fixed 3.5 Hz square wave with no amplitude, and it alternates against the *current*
   face's mouth, so a `shock` face flickers between O and talk. It needs an energy parameter and a
   mouth that is independent of the face table.
3. No squash/stretch hook: `person()` only scales uniformly by `o.s`, so acting.js wraps the canvas
   transform. Adding `o.sq` and `o.headSq` would remove that wrapper.
4. Feet never rotate: `ellipse(f[0]+12, f[1]+2, ...)` always points local +x whatever the leg angle,
   which shows on steep poses.
