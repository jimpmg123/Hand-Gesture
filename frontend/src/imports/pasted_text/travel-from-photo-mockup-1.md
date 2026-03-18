Create a cohesive desktop web app mockup and clickable prototype flow for a project called “Travel From Photo”.

Project concept:
This is an AI-powered travel and food memory navigator. Users upload travel photos and food photos. The system helps identify where travel photos were taken, suggests route guidance, and extends food photos into cuisine discovery and restaurant recommendations. Signed-in users can review grouped city-based memories in a personal gallery and open grouped image collections.

Overall design style:
Use a warm, elegant, editorial dashboard style. The UI should feel modern, minimal, polished, soft, and trustworthy. Use a light cream or warm off-white background, subtle gray or ivory cards, muted teal/green accents, large rounded corners, soft borders, and gentle shadows. Typography should combine a refined serif heading with a clean sans-serif body font. Add a very faint decorative world map silhouette in the background across the main pages.

Important spacing rule:
Do not let text or buttons feel glued to the edges of cards. Every card, thumbnail, panel, title area, and button group should have generous internal padding. Improve readability with comfortable whitespace and balanced spacing throughout.

Shared top section:
Create one reusable shared hero card component that appears consistently on Home, Search, Gallery, Profile, and Images pages.

This shared top card should contain:
- small brand label: “TRAVEL FROM PHOTO”
- large title: “AI travel and food memory navigator”
- small badge: “frontend beta shell”
- supporting description about upload-first discovery, route guidance, signed-in gallery, and food-photo extension into restaurant discovery
- navigation tabs:
  Home / Search / Gallery / Profile

Make this top area feel like one unified reusable card or section with consistent layout and styling across all pages. Only the active tab changes depending on the page.

Gallery page requirements:
Create a Gallery page where each card represents a grouped image collection by city rather than a single photo.

Each group card should include:
- large thumbnail preview area
- small category pill such as “Landmark group”, “Food group”, or “Mixed city memory”
- editable group title
- city and country
- recent update text
- short description explaining that the card contains multiple uploaded images from the same city or memory group
- two buttons:
  “View Images”
  “Open Guide”

Editable title behavior:
Users should be able to directly rename each gallery group.
For example, “Busan memory set” should be editable by the user.
Design this clearly as an editable title field or rename interaction on each group card.
Possible UI patterns:
- inline editable text field
- small edit/pencil icon next to the title
- rename state that becomes active when clicked
Keep it elegant and simple.
This rename ability should feel like part of the gallery card itself, not a separate settings page.

Gallery interaction:
Clicking “View Images” on a group card should navigate to a dedicated Images page for that selected group.

Images page requirements:
Create an Images page for a selected group such as “Busan memory set”.

Top of Images page:
- section label: “IMAGES”
- large title such as “Busan memory set”
- group pill and location label on the same line if useful
- supporting sentence explaining that all images in this group are shown here

Back button requirement:
On the same horizontal level as the page title, place one Back button on the far right side of that title row.
This Back button should return the user to the Gallery page.
Do not remove the lower “Back to Gallery” button if one already exists elsewhere on the page. Keep both:
1. the new upper-right Back button beside the title row
2. the lower “Back to Gallery” button

Images grid:
- below the title section, show a clean responsive gallery grid of actual image thumbnails
- each thumbnail should appear inside a rounded tile or card
- keep generous spacing between thumbnails
- optional metadata such as date or memory type can appear below thumbnails if helpful

Image modal / popup interaction:
When a user clicks an image thumbnail, open a centered popup modal overlay.
The modal should:
- dim the background
- display a large version of the selected image
- include rounded corners and a soft shadow
- optionally show metadata like location, upload date, or category
- include a visible close button

Carousel navigation inside modal:
Inside the popup modal, allow the user to navigate through images using left and right arrow controls.
The arrows should let the user move to the previous or next image in the selected group.

Looping behavior:
The image navigation must be circular.
- If the user is viewing the first image and presses the left arrow, show the last image
- If the user is viewing the last image and presses the right arrow, show the first image
Make this interaction feel smooth and intentional, like a looping gallery carousel

Prototype behavior:
Set up the prototype so that:
- shared hero tabs navigate between Home, Search, Gallery, and Profile
- “View Images” opens the selected group’s Images page
- group titles on Gallery cards appear user-editable
- the upper-right Back button on Images returns to Gallery
- the lower “Back to Gallery” button also remains on the page
- clicking an image thumbnail opens the popup modal
- left and right arrows in the modal navigate between images
- the navigation wraps around from first to last and last to first
- closing the popup returns to the Images grid view

Page set:
1. Home page
2. Search page
3. Gallery page
4. Profile page
5. Images page
6. Image modal overlay state for the Images page

Visual consistency:
- keep the same background tone, typography, spacing system, border radius, and button styling across all pages
- use the same faint world map motif across Home, Search, Gallery, Profile, and Images
- make all pages feel like part of one polished frontend beta shell
- prioritize readability, breathing room, and presentation-ready quality