# Image credits

Photography on the Barnabas Insurance Brokers website comes from [Pexels](https://www.pexels.com/),
which grants free commercial use with no watermark and no attribution requirement. Attribution is
recorded here anyway, because a broker should be able to show where every picture came from.

Every subject is East African, matching the clients we serve. No AI generated imagery is used
anywhere on this site, in line with the brief.

Regenerate or update with `PEXELS_API_KEY=... npm run fetch-pexels`. Slots that still show a
photograph from the design source template are listed at the end as outstanding work.

## How the slots work

`src/data/images.ts` holds ten slots, each with the exact search query required by the brief, a
description used as the `alt` text, and the orientation Pexels should return. The fetch script:

1. Searches Pexels for the slot's query, filtered to the right orientation.
2. Scores the results, preferring photographs whose Pexels description mentions East Africa, then
   the largest files, and never reuses a photograph already used by another slot.
3. Downloads the `large2x` file to `public/images/<slot>.jpg`, next to a `<slot>.photo.json` record
   with the photographer, the Pexels photo page, the licence, and a checksum.
4. Writes `src/data/images.generated.json`, which the app reads at build time.
5. Updates this file with the credit block for every photograph it downloaded.

While a slot is still `null` in `src/data/images.generated.json`, the app falls back to a photograph
that shipped inside the Insure v1.0.0 design source, so the layout never breaks and no code change is
needed when the real photos arrive.

## Run the fetch

```bash
# free key from https://www.pexels.com/api/
PEXELS_API_KEY=xxxxxxxx npm run fetch-pexels

# one or two slots only
PEXELS_API_KEY=xxxxxxxx npm run fetch-pexels -- --only heroFamily,kenyanProfessionalAgent

# replace a photograph that is already in public/images
PEXELS_API_KEY=xxxxxxxx npm run fetch-pexels -- --force

# report which slots are done, without any network call
npm run fetch-pexels -- --check
```

If `PEXELS_API_KEY` is not set the script prints the slot table, explains what to do, and exits 0, so
it can sit in a build pipeline before the key exists.

## Slots and their exact queries

| Slot | Query | Orientation | Used on |
| --- | --- | --- | --- |
| `heroFamily` | African family insurance protection Kenya | landscape | Homepage split hero |
| `eastAfricanCoupleHealth` | East African couple health insurance | landscape | Homepage, health product page |
| `kenyanProfessionalAgent` | Kenyan professional insurance agent | landscape | About page, quote page |
| `africanBusinessmanBroker` | African businessman insurance broker | landscape | Homepage trust band, compare page |
| `eastAfricanCarOwner` | East African car owner vehicle Kenya | landscape | Motor product page |
| `africanHomeowner` | African homeowner house property | landscape | Home and property product page |
| `kenyanFamilyMedical` | Kenyan family medical healthcare | landscape | Health and medical product page |
| `eastAfricanOfficeMeeting` | East African office meeting insurance | landscape | Business page, group schemes |
| `africanWomanSigning` | African woman signing insurance document | landscape | Life product page, testimonials |
| `nairobiBusinessOffice` | Nairobi business office professional | landscape | Careers, contact, footer band |

## Selection rules the script enforces

- **East African subjects only.** A candidate whose Pexels description mentions Africa, Kenya,
  Nairobi, Tanzania, Uganda, Rwanda, Mombasa, Kisumu, Nakuru or East Africa scores highest. A
  candidate with neither an East African description nor the right orientation is rejected, and the
  slot stays on its fallback rather than shipping a wrong photograph.
- **No AI imagery.** Pexels photographs are licensed photography from real photographers. Nothing on
  this site is generated.
- **No watermarks.** Only the Pexels library is used, and the downloaded files are checked to be at
  least 20 KB so a placeholder or error page cannot be saved as a photograph.
- **No repeats.** Once a photograph is used by a slot, it cannot be chosen again.
- **Attribution.** Even though the Pexels licence does not require it, the photographer's name, the
  photo page, and the licence link are written into `public/images/<slot>.photo.json` and into this
  file.

## Outstanding: still on the design source photograph

- `heroFamily`: African family insurance protection Kenya
- `eastAfricanCoupleHealth`: East African couple health insurance
- `kenyanProfessionalAgent`: Kenyan professional insurance agent
- `africanBusinessmanBroker`: African businessman insurance broker
- `eastAfricanCarOwner`: East African car owner vehicle Kenya
- `africanHomeowner`: African homeowner house property
- `kenyanFamilyMedical`: Kenyan family medical healthcare
- `eastAfricanOfficeMeeting`: East African office meeting insurance
- `africanWomanSigning`: African woman signing insurance document
- `nairobiBusinessOffice`: Nairobi business office professional

These slots fall back to photographs that shipped inside the Insure v1.0.0 design source until
`npm run fetch-pexels` has been run with a valid Pexels API key. The script was written and dry run
in this environment, but `api.pexels.com` and `images.pexels.com` are not reachable from the build
sandbox, so the downloads must happen from a machine with internet access, or from the deployment
pipeline, before launch. See INVENTORY.md section 12.
