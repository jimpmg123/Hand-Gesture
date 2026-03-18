Create a cohesive desktop web app mockup and prototype flow for a project called “Travel From Photo”.

Project concept:
This is an AI-powered travel and food memory navigator. Users upload travel photos and food photos. The system helps identify where a travel photo was taken, suggests route guidance, and extends food photos into cuisine discovery and restaurant recommendations. Signed-in users can also review saved uploads and grouped city-based memories in a personal gallery.

Overall design style:
Use a warm, elegant, editorial dashboard style. The UI should feel modern, soft, minimal, trustworthy, and slightly premium. Use a light cream or warm off-white background, pale gray or ivory cards, muted teal/green accents, subtle borders, large rounded corners, and gentle shadows. Typography should combine a refined serif heading with clean sans-serif body text. Add a very faint decorative world map silhouette in the background across the main pages, but keep it low contrast and non-distracting.

Important spacing rule:
Do not let text feel glued to the edges of cards. Every card, panel, section, thumbnail block, and button area must have generous internal padding. Increase whitespace and breathing room inside cards compared to the reference. Make the layout feel clean, readable, and polished.

Main requirement 1: Shared top card across multiple pages
Take the current top section and turn it into one reusable shared hero card component that appears consistently on Home, Search, Gallery, and Profile pages.

This shared hero card should contain:
- small brand label: “TRAVEL FROM PHOTO”
- large title: “AI travel and food memory navigator”
- small pill badge: “frontend beta shell”
- supporting sentence describing upload-first discovery, route guidance, signed-in gallery, and food-photo extension into restaurant discovery
- horizontal navigation buttons/tabs:
  Home / Search / Gallery / Profile

Design this whole area as one unified rounded card or structured section so it feels visually grouped and reusable across pages. The layout, padding, and style should stay consistent on all four pages. Only the active tab changes depending on the page.

Navigation behavior:
- Home tab opens Home page
- Search tab opens Search page
- Gallery tab opens Gallery page
- Profile tab opens Profile page

Main requirement 2: Gallery group-to-images flow
Create a Gallery page where each card represents a grouped image collection by city rather than a single image.
For example, uploads from the same city are grouped into one card such as:
- Busan memory set
- Kyoto food trail
- Chicago city set

Each group card should include:
- large thumbnail preview area at the top
- small category pill such as “Landmark group”, “Food group”, or “Mixed city memory”
- group title
- city and country
- recent update text
- short description explaining that the card contains multiple uploaded images from the same city or memory group
- two buttons:
  “View Images”
  “Open Guide”

Interaction requirement:
When the user clicks “View Images” on a gallery card, navigate to a new Images page for that specific group.

Images page requirements:
Create an Images page template that displays the selected group’s photo collection.
This page should feel visually related to the Gallery page, but instead of group cards, it should show the actual images inside the selected group.

Images page layout:
- reuse the same shared hero card at the top
- below it, add a section label such as “IMAGES”
- large heading like:
  “Busan memory set”
  or the selected group title
- supporting text explaining that this page shows all images saved in the selected group

Image grid behavior:
- show a clean responsive gallery grid of image thumbnails
- each thumbnail should be displayed inside a rounded card or tile
- keep generous spacing between image tiles
- include optional short metadata under each thumbnail such as date or memory type if helpful
- make the layout feel similar to a personal image archive

Modal / popup interaction:
When a user clicks one image thumbnail on the Images page, open a centered popup modal overlay.
The popup should:
- dim the background
- display the clicked image in a large preview
- include rounded corners and a clean shadow
- optionally include small metadata such as location, upload date, or category
- include a visible close button
- feel minimal and polished

Prototype behavior:
Set up the prototype flow so that:
- common hero tabs navigate between Home, Search, Gallery, and Profile
- “View Images” from a gallery group card opens the corresponding Images page
- clicking an image thumbnail on the Images page opens a popup modal
- closing the popup returns to the image grid view

Page structure requests:
1. Home page
- use the shared hero card
- below it, show a large intro/feature section about finding where a photo was taken and extending into food discovery
- keep the soft editorial dashboard style

2. Search page
- use the shared hero card
- below it, show a search/upload workspace for travel-photo and food-photo flows
- this can include upload areas, hint inputs, and result placeholders

3. Gallery page
- use the shared hero card
- remove any right sidebar notes
- use the main width for grouped city-based memory cards
- each card must have “View Images” and “Open Guide”

4. Profile page
- use the shared hero card
- below it, show account and saved context information, privacy controls, and recent activity summary cards

5. Images page
- use the shared hero card
- show the selected group title and a grid of actual image thumbnails
- clicking one image opens a popup modal

Visual consistency:
- the shared hero card must look identical in style across all pages
- maintain the same background tone, card radius, spacing system, button style, and typography
- keep the faint world map background motif across Home, Search, Gallery, Profile, and optionally Images page
- ensure strong alignment and consistent padding throughout

Design goal:
This should look like a polished academic project mockup for a frontend beta shell, not a rough wireframe. Keep it elegant, soft, organized, and presentation-ready.