# May5 hero design QA

## Source reference

- Selected visual: `upload/image(20261104-161747).png` (the ivory and sage silk editorial hero selected by the user).
- Render reviewed in Chrome at `http://terminal.local:4173/`.

## Review

- **Layout and spacing:** two-column desktop composition, copy on the left, product scene on the right, balanced around the original headline and calls to action. On narrow screens, the layout stacks copy above the image and moves header links into the menu.
- **Typography:** large Playfair Display headline keeps the reference's editorial contrast; DM Sans supports labels, paragraph text and navigation. Vietnamese text remains legible and correctly rendered.
- **Color:** warm ivory, dark green-black, and muted sage follow the reference. The hero background is kept flat so the silk photograph carries the visual texture.
- **Image fidelity:** new, standalone May5 product scene uses the selected reference's silk sweep and gift set. It is placed as an image asset so the product is not approximated with CSS shapes.
- **Motion:** gentle photo drift, floating badge, entrance motion, pointer tilt and hover response. `prefers-reduced-motion` disables decorative animation. The product section and service anchors remain intact.
- **Content:** preserved existing Vietnamese copy, product/services sections and collection/service links; navigation labels were aligned to the selected reference.
- **Interaction check:** clicked “Phụ kiện lụa”; the press-on nails card was filtered out. Mobile menu and search/filter/product dialog code remain present.
- **Console:** no page-origin JavaScript errors observed. The browser only reported unrelated extension metadata errors.

## Result

final result: passed

Desktop preview and live GitHub Pages rendering match the chosen direction. Cache-busted CSS and JavaScript URLs ensure browsers fetch the updated layout and interaction code after deploy. Responsive breakpoints and reduced-motion behavior were reviewed in source; a separate mobile viewport screenshot was not captured in this browser session.

