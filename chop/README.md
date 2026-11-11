# Chop Count engine (1,000-cuts videos)

`engine_banana.js` is the reference engine. Start every new chop object from it.

- **Exact 3D pieces:** big rounds use `coin: true` or `exact: true`. Each piece is ray-traced as the object's SDF clipped to its knife box, so the curves are smooth, the cut faces are clean, and there are no voxels.
- **Resting physics:** coins tip onto their cut face, and chunks settle on one of their faces.
- **Tiny pieces:** each one is drawn as a traced 3D cube, not a flat square.
- **Flesh colour:** warm, with a soft glow coming through.
- **Pile:** no tower at the far end.

Full notes: the "Real-3D pieces" section of the project doc `chop-count-format-playbook.md`.

Run from the chop folder with `NODE_PATH=/opt/npm-tools/node_modules`:

    ENGINE=engine_banana.html node thumbshots.js pv "0:4.4,2:6.5,5:12.6"   # QA frames
    ENGINE=engine_banana.html SCENES=scenes_banana node render.js && bash pipeline3.sh
