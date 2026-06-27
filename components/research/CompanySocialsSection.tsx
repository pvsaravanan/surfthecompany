import YoutubeVideosDisplay from "@/components/youtube/YoutubeVideosDisplay";
import RedditDisplay from "@/components/reddit/RedditDisplay";
import TikTokDisplay from "@/components/tiktok/TikTokDisplay";
import GitHubDisplay from "@/components/github/GitHubDisplay";
import {
  YouTubeSkeleton,
  TikTokSkeleton,
  GitHubSkeleton,
  RedditSkeleton,
} from "@/components/skeletons/ResearchSkeletons";
import type { Video, RedditPost } from "@/components/types/research.types";

interface CompanySocialsSectionProps {
  isGenerating: boolean;
  twitterProfileText: any;
  youtubeVideos: Video[] | null;
  tiktokData: any;
  redditPosts: RedditPost[] | null;
  githubUrl: string | null;
}

export default function CompanySocialsSection({
  isGenerating,
  twitterProfileText,
  youtubeVideos,
  tiktokData,
  redditPosts,
  githubUrl,
}: CompanySocialsSectionProps) {
  const hasSocialsData = twitterProfileText || youtubeVideos || tiktokData || redditPosts || githubUrl;

  return (
    <div className="space-y-16 pt-12">
      {hasSocialsData && (
        <div className="flex items-center">
          <h2 className="text-4xl font-medium">Company Socials</h2>
        </div>
      )}

      {isGenerating && youtubeVideos === null ? (
        <YouTubeSkeleton />
      ) : youtubeVideos && youtubeVideos.length > 0 && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <YoutubeVideosDisplay videos={youtubeVideos} />
        </div>
      )}

      {isGenerating && redditPosts === null ? (
        <RedditSkeleton />
      ) : redditPosts && redditPosts.length > 0 && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <RedditDisplay posts={redditPosts} />
        </div>
      )}

      {isGenerating && tiktokData === null ? (
        <TikTokSkeleton />
      ) : tiktokData && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <TikTokDisplay data={tiktokData} />
        </div>
      )}

      {isGenerating && githubUrl === null ? (
        <GitHubSkeleton />
      ) : githubUrl && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <GitHubDisplay githubUrl={githubUrl} />
        </div>
      )}
    </div>
  );
}
