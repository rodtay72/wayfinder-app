# Way Finder - Setup Guide for Business Partner

This guide will help you set up your laptop to edit Way Finder content and deploy changes.

## 🎯 What You'll Be Editing

You'll primarily edit the **`content.js`** file, which contains:
- All text and copy (titles, messages, instructions)
- Activity lists for each ALIGN phase
- Emotional stability markers and their guided examples
- UI labels and button text

**No coding knowledge needed!** Just edit the text between the quotes.

---

## 🛠️ Setup Steps

### 1. Install VSCode (Visual Studio Code)

**VSCode** is a free code editor that makes editing files easy.

1. Download from: https://code.visualstudio.com/
2. Install it (just click through the installer)
3. Open VSCode

### 2. Install Claude Code (Optional but Recommended)

**Claude Code** lets you ask Claude to make changes directly in your files.

**Installation:**
```bash
# On Mac/Linux, open Terminal and run:
curl -fsSL https://storage.googleapis.com/claude-code/install.sh | sh

# On Windows, open PowerShell and run:
irm https://storage.googleapis.com/claude-code/install.ps1 | iex
```

After installing, you can type `claude` in your terminal to start.

**Using Claude Code:**
```bash
# Navigate to your project folder
cd path/to/wayfinder_modular

# Ask Claude to make changes
claude "Change the hero title to 'Building Better Connections'"
claude "Add a new activity to the Nurture phase"
```

### 3. Alternative: Deploy with Vercel

If you want to publish the app online where anyone can access it:

**Vercel Setup:**
1. Sign up at https://vercel.com (it's free)
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. In your project folder, run:
   ```bash
   vercel
   ```
4. Follow the prompts - Vercel will give you a live URL!

**To update after changes:**
```bash
vercel --prod
```

---

## 📝 How to Edit Content

### Opening Your Files

1. Open VSCode
2. Click **File → Open Folder**
3. Select the `wayfinder_modular` folder
4. You'll see all files in the sidebar

### Editing `content.js`

This is the main file you'll edit. Here's what each section does:

#### **Brand & Messaging**
```javascript
const BRAND = {
  appName: "Way Finder",  // ← Change app name here
  tagline: "A space to find your way back to each other",  // ← Change tagline
  // ...
};
```

#### **Adding/Editing Activities**
```javascript
const ACTIVITIES = {
  A: [
    "Mirror emotions - name what you see on their face",  // ← Edit existing
    "YOUR NEW ACTIVITY HERE",  // ← Add new activity
  ],
  // ...
};
```

#### **Editing Emotional Stability Markers**
```javascript
const MARKERS = [
  {
    key: 'present',
    label: 'I was here in the moment',  // ← The checkbox label
    guide: 'I will notice what my child is doing...'  // ← The guided example
  },
  // ...
];
```

#### **Changing Button Text**
```javascript
const UI_TEXT = {
  buttons: {
    continue: "Continue to reflection",  // ← Edit button text
    addEntry: "Add to my journal entry",
    // ...
  }
};
```

### Editing Styles (`styles.css`)

Want to change colors or fonts?

```css
:root {
  --forest: #2A3B36;        /* Main dark color */
  --sage: #7C9885;          /* Sage green accent */
  --cream: #FBF5EA;         /* Background cream */
  --coral: #E59BAA;         /* Pink accent */
  /* Change these color codes! */
}
```

---

## 🔄 Typical Workflow

### Option A: Local Editing (No Claude Code)
1. Open `content.js` in VSCode
2. Make your changes
3. Save the file (Ctrl+S or Cmd+S)
4. Open `index.html` in your browser to test
5. If publishing: run `vercel --prod`

### Option B: With Claude Code
1. Open Terminal in VSCode (Terminal → New Terminal)
2. Ask Claude to make changes:
   ```bash
   claude "Change the hero subtitle to 'Creating emotional safety for children'"
   claude "Add 'Painting together' to the Invite activities"
   ```
3. Claude will edit the file for you
4. Check the changes in `content.js`
5. Test in browser, then deploy

---

## 🧪 Testing Your Changes

**Testing Locally:**
1. Open `index.html` in your browser (double-click the file)
2. Or use VSCode's Live Server extension:
   - Install "Live Server" extension in VSCode
   - Right-click `index.html` → "Open with Live Server"
   - Changes auto-refresh!

**What to Test:**
- ✅ All text appears correctly
- ✅ Activities show up in the right phase
- ✅ Buttons work
- ✅ No console errors (press F12 to check)

---

## 📁 File Structure Reference

```
wayfinder_modular/
├── index.html        # Main structure (rarely edit)
├── content.js        # ← YOU EDIT THIS! All text & activities
├── styles.css        # Colors, fonts, layout
├── app.js            # React components (technical)
├── images.js         # Image data
└── SETUP.md          # This guide
```

---

## 🆘 Troubleshooting

**"The page is blank!"**
- Check browser console (F12) for errors
- Make sure all files are in the same folder
- Check if you added a comma or quote correctly in `content.js`

**"My changes don't show up!"**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Make sure you saved the file!

**"I broke something!"**
- Don't panic! VSCode has undo (Ctrl+Z)
- Or use Claude Code: `claude "Fix any syntax errors in content.js"`

---

## 💡 Tips

1. **Always save before testing** (Ctrl+S / Cmd+S)
2. **Make one change at a time** so you know what broke if something goes wrong
3. **Keep a backup** of `content.js` before major changes
4. **Use Claude Code** for bulk changes - it's faster than manual editing
5. **Test in different browsers** (Chrome, Safari, Firefox)

---

## 🎓 Learning Resources

- **VSCode Basics:** https://code.visualstudio.com/docs/getstarted/tips-and-tricks
- **Claude Code Docs:** https://docs.claude.com/en/docs/build-with-claude/claude-code
- **Vercel Docs:** https://vercel.com/docs

---

## 📞 Need Help?

If you get stuck:
1. Check this guide first
2. Ask Claude Code: `claude "Help me fix this error in content.js"`
3. Contact your technical partner
4. Google the error message (seriously, this works!)

---

**You've got this!** 🚀 Most edits are just changing text between quotes. Start small, test often, and you'll be editing like a pro in no time.
