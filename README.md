# Sadaf turns thirty

Invitation page for Sadaf's 30th — Rotterdam & Schiedam, 26 or 27 September 2026.
Live at <https://ojallington.github.io/sadaf-30/>

Single static page (`index.html` plus `sadaf-hero.js`, the animated hero designed in Claude Design and shared with the preview card), no build step, no backend. Replies are composed in the page
and sent by the guest into the WhatsApp group — nothing is stored or transmitted here.

## Locking in the date once the poll lands

In `index.html`, the `PARTY` config block near the top of the `<script>`:

    decided: true,                       // flip this
    isoDate: '2026-09-27',               // if Sunday wins
    label:   'Sunday 27 September 2026',

Everything follows from it: the kicker, the footer, the countdown and its caption,
the calendar file, every "TO BE CONFIRMED" stamp (they turn green and read
"CONFIRMED"), and the "One of two dates" section and the date radios in the reply
form, which are hidden automatically. The composed message drops its date line too.

## Regenerating the link-preview card

    chromium --headless --no-sandbox --window-size=1200,630 \
      --virtual-time-budget=8000 --screenshot=og.png file://$PWD/og.html
    magick og.png -quality 84 -sampling-factor 4:2:0 -strip og.jpg

The page links `og.jpg`, not the PNG: WhatsApp only shows preview images under
about 300 KB. Keep an eye on the size after regenerating.
