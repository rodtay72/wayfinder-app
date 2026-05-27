# Way Finder - Modular Structure

This is the modular version of Way Finder, structured for team collaboration.

## 📁 File Structure

```
wayfinder_modular/
├── index.html        # Main HTML file (loads everything)
├── content.js        # ★ EDIT THIS! All text, activities, markers
├── styles.css        # All styling (colors, fonts, layout)
├── app.js            # React components & logic
├── images.js         # Image assets (placeholder)
├── SETUP.md          # Setup guide for business partner
└── README.md         # This file
```

## 🎯 Quick Start

### For Business Partner (Non-Technical)
1. Read **SETUP.md** for full setup instructions
2. Install VSCode: https://code.visualstudio.com/
3. Open `content.js` and edit text between quotes
4. Save and test by opening `index.html` in browser

### For Developer
1. Open folder in VSCode
2. Use Live Server extension for hot reload
3. Edit files as needed
4. Deploy with Vercel: `vercel --prod`

## 🔄 Typical Edits

### Changing Text/Copy
→ Edit **content.js** (lines 1-275)
- Brand messaging
- Activity lists
- Marker labels and guides
- Button text
- UI labels

### Changing Colors/Styling
→ Edit **styles.css** (lines 1-146)
- CSS variables at top for colors
- Fonts, spacing, layout

### Changing Logic/Features
→ Edit **app.js** (lines 1-702)
- React components
- Form validation
- Data flow

## 🚀 Deployment

### Local Testing
```bash
# Just open in browser
open index.html

# Or use Live Server in VSCode
```

### Vercel Deployment
```bash
# First time
vercel

# Updates
vercel --prod
```

### With Claude Code
```bash
# Make content changes
claude "Change hero title to 'Building Connection'"

# Add activities
claude "Add 'Story time' to Nurture activities"

# Deploy
vercel --prod
```

## 📝 What Each File Does

**index.html** (28 lines)
- Loads React, Babel, and all other files
- Minimal structure - rarely needs editing

**content.js** (275 lines) ★ MAIN EDIT FILE
- BRAND: app name, tagline, messages
- PHASES: ALIGN phase names
- ACTIVITIES: 52 activities across phases
- MARKERS: 6 emotional stability markers
- CAB_FIELDS: reflection field labels
- VALUE_GROUPS: DISC words for analysis
- SHIFT_WORDS: guidance words
- CULTURE: cultural context notes
- UI_TEXT: all button/label text

**styles.css** (146 lines)
- CSS variables for easy theming
- Component styles
- Responsive layout
- Color scheme

**app.js** (702 lines)
- React components
- State management
- Auto-analysis logic
- Form handling
- NOT for content editing

**images.js**
- Placeholder for image assets
- Can be expanded later

**SETUP.md**
- Detailed setup guide for partner
- VSCode installation
- Claude Code usage
- Vercel deployment
- Troubleshooting tips

## 🤝 Collaboration Workflow

1. **Business Partner** edits content.js
2. **Developer** reviews and handles app.js/styles.css
3. Both test locally
4. Deploy to Vercel when ready

## ⚠️ Important Notes

- Always save before testing (Ctrl+S / Cmd+S)
- Test in browser after changes
- Keep backups of content.js before major edits
- Use Claude Code for bulk changes
- Hard refresh browser if changes don't show (Ctrl+Shift+R)

## 📞 Support

- Read SETUP.md for detailed instructions
- Use Claude Code for guided edits
- Test changes locally before deploying
- Contact developer for technical issues

---

**Last updated:** 2026-05-26
