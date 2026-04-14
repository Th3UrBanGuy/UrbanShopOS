# AI SmartBook - Next.js Application

A beautiful, full-featured Next.js application that combines a stunning book UI with AI-powered content organization. The app uses Google's Generative AI for embeddings, FAISS for semantic search, and Google Drive for persistence.

## Features

- **Beautiful Book UI**: Cream-colored paper theme with realistic book aesthetics
- **AI-Powered Organization**: Automatically places content in appropriate chapters
- **Semantic Search**: Uses Pinecone for finding related content
- **Cloud Storage**: Cloudflare R2 for global, low-latency persistence
- **Backup**: Automated JSON backups to Google Drive
- **Real-time Updates**: See your book update instantly as you add content
- **Responsive Design**: Works on desktop and mobile
- **Chapter Navigation**: Easy navigation through chapters and pages
- **Smooth Animations**: Page transitions and UI interactions

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **AI/ML**: 
  - Google Generative AI (Gemini) for embeddings
  - Pinecone for vector similarity search
- **Storage**: Cloudflare R2 (Active) + Google Drive (Backup)
- **UI Components**: Framer Motion, Lucide React

## Project Structure

```
frontend/
├── app/
│   ├── api/
│   │   ├── health/          # Health check endpoint
│   │   ├── process-text/    # AI text processing endpoint
│   │   └── book/            # Book data endpoints
│   ├── globals.css          # Global styles with book theme
│   ├── layout.tsx           # Root layout with fonts
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── Dashboard.tsx        # Main dashboard component
│   ├── BookViewer.tsx       # Book reading interface
│   └── TextInput.tsx        # Text input with AI processing
├── store/
│   └── bookStore.ts         # Zustand state management
├── types/
│   └── index.ts             # TypeScript interfaces
├── package.json
├── tsconfig.json
└── .env.example
```

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=rag-notes-index

# Cloudflare R2
CLOUDFLARE_R2_ENDPOINT=https://your-endpoint.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=darbar

# Google Drive (Backup)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Google AI Configuration
GOOGLE_API_KEY=your_google_api_key_here
```

#### Setting up Pinecone DB:
1. Go to [Pinecone](https://app.pinecone.io) and create an account.
2. Create a new Index named `rag-notes-index`.
3. Set the **Dimensions** to `768`.
4. Grab your API key from the dashboard.

#### Getting Google API Key:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Copy the key to `GOOGLE_API_KEY`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## How It Works

### Adding Content

1. Enter text in the input panel on the right
2. Click "Add to Book"
3. The AI will:
   - Generate an embedding vector of your text
   - Search for semantically similar content
   - Use LLM to determine the best placement (new chapter, insert, or append)
   - Store the page and update the book structure

### Book Organization

- **Chapters**: Automatically created based on content similarity
- **Pages**: Ordered within chapters
- **Navigation**: Use sidebar, arrow buttons, or chapter indicators
- **Persistence**: All data saved to Google Drive

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/process-text` - Process and add text to book
  - Request: `{ rawText: string }`
  - Response: `{ status, placement, page }`
- `GET /api/book` - Get complete book data
- `DELETE /api/book` - Clear all book data

## UI Components

### Dashboard
- Split view: Book viewer (left) + Controls (right)
- Real-time statistics
- Quick actions

### BookViewer
- Realistic book styling with paper texture
- Smooth page transitions
- Sidebar navigation
- Chapter/page indicators
- Keyboard navigation support (arrow keys)

### TextInput
- Large text area with character count
- AI processing indicator
- Success feedback
- Auto-resize

## Customization

### Themes

The app uses a warm, book-like color scheme:
- Background: `#f5f5dc` (cream)
- Paper: `#fffef0` (off-white)
- Accents: Amber tones (`#92400e`, `#78350f`)

Modify `globals.css` to change colors.

### Fonts

- **Body**: Inter (sans-serif)
- **Content**: Merriweather (serif) for book-like reading experience

Change fonts in `app/layout.tsx`.

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Other Platforms

1. Build the app: `npm run build`
2. Set environment variables
3. Deploy the `.next` folder

## Troubleshooting

### FAISS Issues

If you encounter issues with `faiss-node`:

```bash
# macOS
brew install libomp

# Linux
sudo apt-get install libopenblas-dev

# Then reinstall
npm uninstall faiss-node
npm install faiss-node
```

### Google Drive Permissions

Ensure the service account has:
- Google Drive API enabled
- Access to the folder (shared)
- Proper JSON credentials

### Environment Variables

Make sure all required variables are set in `.env.local`:
- No quotes around JSON in `GOOGLE_SERVICE_ACCOUNT_JSON`
- Valid `GOOGLE_DRIVE_FOLDER_ID`
- Valid `GOOGLE_API_KEY`

## License

MIT License - feel free to use for personal or commercial projects.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
