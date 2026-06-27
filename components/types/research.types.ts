// Shared domain types for the company research feature

export interface LinkedInData {
  text: string;
  url: string;
  image: string;
  title: string;
  [key: string]: any;
}

export interface Video {
  id: string;
  url: string;
  title: string;
  author: string;
  [key: string]: any;
}

export interface RedditPost {
  url: string;
  title: string;
  [key: string]: any;
}

export interface Tweet {
  id: string;
  url: string;
  title: string;
  author: string;
  [key: string]: any;
}

export interface Competitor {
  title: string;
  url: string;
  summary: string;
  [key: string]: any;
}

export interface NewsItem {
  url: string;
  title: string;
  image: string;
  [key: string]: any;
}

export interface Founder {
  url: string;
  title: string;
  [key: string]: any;
}

export interface CompanyMapData {
  companyName: string;
  rootNode: {
    title: string;
    children: Array<{
      title: string;
      description: string;
      children: Array<{
        title: string;
        description: string;
      }>;
    }>;
  };
}
