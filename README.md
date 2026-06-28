# surfthecompany
Powered by Exa.ai - The Search Engine for AI Applications

## Description

surfthecompany is an open-source tool designed to analyze and understand any company. By inputting a company's URL, the application gathers information from across the web, presenting comprehensive insights about the organization, its products, funding history, social media presence, and competitors.

## Data Sources and API Endpoints

All data is retrieved using Exa's search API. The following table describes the query types and the corresponding target domains:

| Category | Description / Scope | Target Domains / Search Type |
| :--- | :--- | :--- |
| Website Information | Company site content, main sections, about pages, pricing details, and FAQs | Neural Search, livecrawl always, subpages target |
| LinkedIn | Company profile and details on its founders or key members | linkedin.com |
| Financial Information | Funding detail summaries, Crunchbase, PitchBook, and Tracxn profiles | crunchbase.com, pitchbook.com, tracxn.com |
| Financial Reports | 10K financial reports | SEC filings and financial report search type |
| Market Intelligence | Media coverage, news, competitor analysis, and Wikipedia entries | News search, wikipedia.org, neural web searches |
| Social Media Presence | Profiles and recent posts from Twitter/X, YouTube, TikTok, and Reddit | x.com, twitter.com, youtube.com, tiktok.com, reddit.com |
| Code Repositories | GitHub profiles and repository data | github.com |

## Tech Stack

The application is built using the following technologies:

| Layer | Technology |
| :--- | :--- |
| Search Engine | Exa.ai Web Search API |
| Frontend | Next.js App Router |
| Styling | Tailwind CSS |
| Language | TypeScript |
| AI Integration | Vercel AI SDK |
| Hosting | Vercel |

## Getting Started

### Prerequisites

You need to have the following installed and configured:

| Prerequisite | Purpose |
| :--- | :--- |
| Node.js | Local runtime environment |
| Exa.ai API Key | For fetching web data |
| Anthropic API Key | For AI content synthesis and parsing |

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pvsaravanan/surfthecompany.git
   cd surfthecompany
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser.

## Environment Setup

Configure the environment variables in a `.env.local` file in the root of the project:

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| EXA_API_KEY | Yes | API Key from the Exa Dashboard |
| ANTHROPIC_API_KEY | Yes | API Key from the Anthropic Console |
| YOUTUBE_API_KEY | No | Optional API Key for YouTube features |
| GITHUB_TOKEN | No | Optional Personal Access Token for GitHub features |

## About Exa.ai

This project is powered by Exa.ai, a search engine and web search API designed specifically for AI applications, providing semantic search, clean web content extraction, and real-time data retrieval.
