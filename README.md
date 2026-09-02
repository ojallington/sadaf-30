# Sadaf turns thirty

Invitation page for Sadaf's 30th — Rotterdam & Schiedam, 26 or 27 September 2026.
Live at <https://ojallington.github.io/sadaf-30/>

Single static page, no build step, no backend. Replies are composed in the page
and sent by the guest into the WhatsApp group — nothing is stored or transmitted here.

## Locking in the date once the poll lands

In `index.html`, the `PARTY` config block near the top of the `<script>`:

    decided: true,                       // flip this
    isoDate: '2026-09-27',               // if Sunday wins
    label:   'Sunday 27 September 2026',

The kicker, the footer, the countdown and the calendar file all follow from it.
Then trim the "Two dates, one to choose" section and the date radios in the reply form.

## Regenerating the link-preview card

    chromium --headless --no-sandbox --window-size=1200,630 \
      --virtual-time-budget=8000 --screenshot=og.png file://$PWD/og.html
