# JLearn-MM Project Context

## App Overview
- App Name: JLearn-MM
- URL: n3-standard-2400-z9fx.vercel.app
- Stack: React + TypeScript + Vite + Tailwind CSS
- Database: Supabase (project: rtfumxdmgldvseuxarjo)
- Audio Storage: Supabase Storage (listening-audio bucket)
- Deployment: Vercel (auto-deploy from GitHub)
- GitHub: kabani-app/N3-STANDARD-2400

## App Structure - Tabs
1. Meaning - N3 Vocabulary flashcards (1841 words)
   - Part 1 (54 units) / Part 2 (20 units)
   - Flashcard with Myanmar meaning
   - Same meanings / Opposites (Gemini API)
   
2. Kanji - N3 Kanji 361 characters
   - Flashcard with stroke order animation (KanjiVG)
   - Compound words on card back
   - Units: U1-U18 (20 kanji each)

3. Grammar - N3 Grammar patterns (65 points)
   - Category tabs: Conditional/Causative/Passive etc
   - Accordion expand/collapse
   - Color-coded Japanese examples
   - Fully offline (hardcoded data)

4. Listening - Shin Kanzen Master N3 Audio
   - 133 tracks from Supabase Storage
   - CD-A (53 tracks) / CD-B (80 tracks)
   - Built-in audio player

5. Books - PDF Study Books
   - Google Drive PDF embed + download
   - Categories: N3 Books / မေးခွန်းဟောင်း
   - Admin managed via Supabase DB

6. J-Media - Japanese Media
   - Songs: YouTube embed (Supabase DB)
   - Lessons: YouTube Playlists (Supabase DB)
   - News & Podcast: External links (Supabase DB)
   - Admin Panel (hidden: logo x5 clicks)

## Environment Variables (Vercel)
- VITE_GEMINI_API_KEY → Gemini API
- VITE_SUPABASE_URL → https://rtfumxdmgldvseuxarjo.supabase.co
- VITE_SUPABASE_ANON_KEY → Supabase anon key

## Supabase Tables
- songs (id, title, artist, youtube_id, description_mm)
- youtube_channels (id, channel_name, youtube_id, 
  description_mm, level, playlist_id)
- playlists (id, title, description_mm, category, 
  thumbnail_youtube_id)
- news_podcasts (id, title, url, description_mm, type)
- books (id, title, description_mm, drive_file_id, 
  category, file_size)

## Design System
- Dark theme throughout
- Primary color: Purple/Blue (#6C63FF)
- Myanmar font: Myanmar Text
- Mobile: bottom navigation bar
  (Meaning | Kanji | Grammar | Listening | Books)
- Desktop: top navbar

## Admin Panel
- Access: Click JLearn-MM logo 5 times
- Username: jlearn_admin
- Password: JLearn@2024
- Manages: Songs, Lessons, Playlists, News, Books

## Important Rules
- NEVER change existing working features
- NEVER remove existing data files
- Always maintain dark theme
- Myanmar translations must be accurate
- Grammar data is hardcoded (offline capable)
- Kanji data is in src/data/kanji_n3.ts
- Vocabulary data is in src/data/ folder
