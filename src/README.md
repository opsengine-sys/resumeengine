# Resume Engine 🚀

A modern, privacy-first resume builder that runs entirely in your browser. Create professional resumes with multiple templates, built-in AI tools, and LaTeX export — no sign-up required, no data leaves your device.

![Resume Engine](https://img.shields.io/badge/Status-Active%20Development-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)

---

## ✨ Features

### 📝 Resume Builder
- **12+ Resume Sections**: Personal Info, Summary, Skills, Experience, Education, Projects, Certifications, Achievements, Languages, Volunteer, Publications, References
- **Custom Sections**: Add your own sections with custom fields (text, date, long text, dropdown)
- **9 Professional Templates**: LaTeX/FAANG, Modern, Classic, Executive, Minimal, Harvard, Jake's, Chicago, ATS-Safe
- **Drag & Drop**: Reorder sections with intuitive drag-and-drop
- **Show/Hide Sections**: Toggle visibility with eye icon
- **Multi-Page Preview**: See exactly how your resume will print across multiple pages
- **Page Size Options**: A4, Letter, Legal formats

### 🎨 Customization
- **Typography Controls**: 
  - Global font selection + per-text-level overrides
  - Font size, weight, case, italic for each text level
  - Line height, spacing controls
- **Color Customization**:
  - Text, heading, link, accent colors
  - Border toggle
  - Page numbers toggle
- **Text Levels**: Customize styles for Candidate Name, Headline, Contact Info, Section Titles, Job Titles, Company Names, Dates

### 🤖 AI-Powered Tools
- **Skills Extractor**: Automatically scans your experience, certifications, and achievements to extract relevant skills
- **Summary Generator**: Auto-generates professional summaries from your resume data
- **Content Rephraser**: Rewrites bullet points with power action verbs

### 📄 Export Options
- **LaTeX Export**: Download `.tex` and `.cls` files for use in Overleaf or other LaTeX editors
- **PDF Print**: Browser-based print to PDF with proper page breaks
- **Multi-page Support**: Handles resumes spanning multiple pages correctly

### 🌓 User Experience
- **Dark Mode**: Full light/dark theme support
- **Auto-Save**: Automatic saving to browser localStorage every 800ms
- **100% Private**: All data stays in your browser — no servers, no tracking, no accounts
- **Responsive Design**: Works on desktop and mobile devices

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Zustand** | Global state management |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations |
| **@dnd-kit** | Drag & drop functionality |
| **html2canvas + jsPDF** | PDF generation |
| **react-icons** | Icon library |

---

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher) — [Download here](https://nodejs.org)
- **npm** (comes with Node.js)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resume-engine.git
   cd resume-engine