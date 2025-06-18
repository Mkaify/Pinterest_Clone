# Pinterest Clone - Setup Guide

This is a fully-featured Pinterest clone built with Next.js 15, TypeScript, Prisma, and NextAuth.js.

## 🎯 Features Implemented

### ✅ **Complete Features:**
- **Authentication**: Login/Signup with Google OAuth and credentials
- **Pin Management**: Create, view, search pins with image upload
- **User Profiles**: Profile pages with created/saved pins tabs
- **Image Handling**: Cloudinary integration for image storage
- **Responsive Design**: Mobile-first Pinterest-style masonry layout
- **Search**: Comprehensive search functionality
- **Explore Page**: Browse trending pins and categories

### 🔧 **Tech Stack:**
- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: API Routes, Prisma ORM
- **Database**: PostgreSQL (configurable)
- **Authentication**: NextAuth.js
- **Image Storage**: Cloudinary
- **UI Components**: Lucide React icons, Sonner toasts

## 🚀 Quick Setup

### 1. **Install Dependencies**
```bash
bun install
# or
npm install
```

### 2. **Environment Variables**
Create `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pinterest_clone"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### 3. **Database Setup**
```bash
# Generate Prisma client
bun prisma generate

# Run database migrations
bun prisma db push

# (Optional) Seed database
bun prisma db seed
```

### 4. **Run Development Server**
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app!

## 📝 Detailed Setup Instructions

### **Database Configuration**

#### Option A: PostgreSQL (Recommended)
1. Install PostgreSQL locally or use a cloud service
2. Create a new database named `pinterest_clone`
3. Update `DATABASE_URL` in `.env.local`

#### Option B: SQLite (For development)
Change in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### **Google OAuth Setup (Optional)**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### **Cloudinary Setup**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard to find your credentials
3. Add credentials to `.env.local`

## 🏗️ Project Structure

```
src/
├── app/                    # App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── pins/          # Pin CRUD operations
│   ├── auth/              # Login/signup pages
│   ├── create/            # Pin creation page
│   ├── explore/           # Explore pins page
│   ├── pin/[id]/          # Individual pin view
│   ├── search/            # Search results page
│   └── user/              # User profile & settings
├── components/            # Reusable components
│   ├── masonry/           # Pinterest-style grid
│   ├── navbar/            # Navigation components
│   └── providers/         # Context providers
└── lib/                   # Utilities
    ├── cloudinary/        # Image upload utilities
    ├── prisma.ts          # Database client
    └── utils.ts           # Helper functions
```

## 🧪 Testing the App

### **Basic Flow:**
1. **Sign up** or **log in** with email/password or Google
2. **Create a pin** by uploading an image and adding details
3. **Browse pins** on the home page with masonry layout
4. **Search** for specific pins or categories
5. **Explore** trending content and categories
6. **View profile** to see your created pins
7. **Edit profile** in settings

### **Test Credentials:**
- Create an account or use Google OAuth
- No seed data included - create pins to populate the app

## 🔍 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pins` | Get all pins (with pagination/search) |
| POST | `/api/pins` | Create new pin |
| POST | `/api/auth/register` | Register new user |
| * | `/api/auth/[...nextauth]` | NextAuth.js endpoints |

## 🎨 Customization

### **Styling:**
- Modify `tailwind.config.ts` for theme changes
- Update `app/globals.css` for global styles
- Customize components in `src/components/`

### **Features to Add:**
- Pin saving/bookmarking functionality
- Comment system on pins
- User following/followers
- Board creation and organization
- Real-time notifications
- Image editing tools

## 🐛 Troubleshooting

### **Common Issues:**

#### Database Connection
```bash
# Reset database
bun prisma db push --force-reset
```

#### Type Errors
```bash
# Regenerate Prisma client
bun prisma generate
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
bun run build
```

## 📦 Deployment

### **Vercel (Recommended)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### **Other Platforms**
- Configure build command: `bun run build`
- Configure start command: `bun run start`
- Set Node.js version to 18+

## 🎯 Next Steps

The Pinterest clone is feature-complete for a MVP! Consider adding:

1. **Enhanced Search**: Filters, sorting, advanced queries
2. **Social Features**: Follow users, activity feed
3. **Board System**: Organize pins into collections
4. **Analytics**: Pin performance, user engagement
5. **Mobile App**: React Native companion app
6. **AI Features**: Smart categorization, recommendations

---

**Happy coding!** 🎨✨

For questions or issues, check the existing code or create an issue in the repository. 