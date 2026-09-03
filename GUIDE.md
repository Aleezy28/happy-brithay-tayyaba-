# Birthday App — Setup Guide

## How to Add Your Own Photos

1. Open the project folder in VS Code
2. Go to the `public/assets/` folder
3. Add your photos there, named exactly:
   - `pic1.jpg` — main memory photo (letter vault + scrapbook)
   - `pic2.jpg` — second memory photo (scrapbook even pages)
   - `pic3.jpg` — extra photo (scrapbook page 5+)
4. If a photo is missing, the app automatically shows a placeholder so nothing breaks

## How to Change the Music

The YouTube track is already set up. To change it:
1. Open `src/data.ts`
2. Find the line: `export const YOUTUBE_MUSIC_ID = '_z-1fTlSDF0';`
3. Replace the ID with any YouTube video ID (the part after `youtu.be/` or `v=` in a YouTube URL)

## How to Edit Text (Letters, Captions, Quiz, Wishes, Duas)

All text content is in `src/data.ts`:
- `LETTERS` — the 4 birthday letters
- `SCRAPBOOK_CAPTIONS` — the 15 scrapbook page captions
- `QUIZ_QUESTIONS` — the friendship quiz questions
- `ORACLE_PREDICTIONS` — the 2031 destiny predictions (mix of duas and fun)
- `MOOD_QUOTES` — the mood booster quotes with duas
- `TELEPATHY_THOUGHTS` — the telepathy mind-reader messages
- `BIRTHDAY_WISHES` — 12 birthday wishes for her innocent soul
- `DUAS` — 14 heartfelt duas in Roman Urdu
- `SHYNESS_LEVELS` — K-Drama shyness meter levels
- `CHEAT_SCRIPTS` — exam hall cheat slip messages
- `CANCELLATION_REASONS` — plan cancellation tracker reasons
- `SILENT_ADVICE` — silent advisor telepathy messages
- `KDRAWMA_STATS` — K-Drama binge scanner stats
- `DECIBEL_READINGS` — silent-mode decibel readings
- `KITTEN_MESSAGES` — anger cool-down kitten messages
- `LASSI_OVERTHINKING` — lassi brain overthinking questions
- `WHATSAPP_TREAT_MSG` — WhatsApp treat demand message

## How to Run This App in VS Code Terminal

1. Open the project folder in VS Code
2. Open a terminal: click **Terminal > New Terminal** at the top menu
3. Install dependencies (only needed once):
   ```
   npm install
   ```
4. Start the app:
   ```
   npm run dev
   ```
5. It will show a link like `http://localhost:5173` — click it or paste it in your browser
6. The app is now running! Enter passcode **0409** to unlock

## How to Deploy Live for FREE (GitHub Pages)

1. Open the project in VS Code
2. Open a terminal (Terminal > New Terminal)
3. Run:
   ```
   npm run build
   ```
4. The `dist/` folder is generated — this is your live website
5. Push the project to a GitHub repository:
   - Create a new repository on GitHub.com
   - In VS Code terminal run:
     ```
     git init
     git add .
     git commit -m "Birthday app for Tayyaba"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
     git push -u origin main
     ```
6. Go to your repo on GitHub.com > Settings > Pages
7. Set source to "Deploy from a branch" > `main` > `/dist` folder
8. Wait 2-3 minutes, then your live link will appear at the top of that page
9. Share that link with Tayyaba on WhatsApp!

### Alternative: Deploy on Netlify (also free)

1. Go to https://netlify.com and sign up (free)
2. Drag and drop the `dist/` folder onto the Netlify dashboard
3. Your site is live instantly with a URL you can share
4. Or connect your GitHub repo to Netlify for automatic updates

## Project Structure

```
public/assets/       ← put your photos here (pic1.jpg, pic2.jpg, pic3.jpg)
src/data.ts          ← all text content (letters, captions, quiz, duas, wishes)
src/screens/         ← the 6 screens
  LockScreen.tsx     ← Screen 1: passcode gateway with flower rain
  LoadingScreen.tsx  ← Screen 2: loading + age odometer
  CakeScreen.tsx     ← Screen 3: cake + music + mic blow
  LetterScreen.tsx   ← Screen 4: letters + scratch cards
  ScrapbookScreen.tsx← Screen 5: 15-page scrapbook + quiz
  GalaxyScreen.tsx   ← Screen 6: cosmic galaxy with 10 fun features + games
src/App.tsx          ← screen flow controller with petal rain transitions
```
