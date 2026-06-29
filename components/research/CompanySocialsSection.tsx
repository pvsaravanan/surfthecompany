import YoutubeVideosDisplay from "@/components/youtube/YoutubeVideosDisplay";
import RedditDisplay from "@/components/reddit/RedditDisplay";
import GitHubDisplay from "@/components/github/GitHubDisplay";
import RecentTweetsDisplay from "@/components/twitter/RecentTweetsDisplay";
import {
  YouTubeSkeleton,
  GitHubSkeleton,
  RedditSkeleton,
  TwitterSkeleton,
} from "@/components/skeletons/ResearchSkeletons";
import type { Video, RedditPost, Tweet, TwitterProfileText } from "@/components/types/research.types";

interface CompanySocialsSectionProps {
  isGenerating: boolean;
  twitterProfileText: TwitterProfileText | null;
  recentTweets: Tweet[] | null;
  recentMentions: Tweet[] | null;
  youtubeVideos: Video[] | null;
  redditPosts: RedditPost[] | null;
  githubUrl: string | null;
}

export default function CompanySocialsSection({
  isGenerating,
  twitterProfileText,
  recentTweets,
  recentMentions,
  youtubeVideos,
  redditPosts,
  githubUrl,
}: CompanySocialsSectionProps) {
  const hasSocialsData =
    twitterProfileText ||
    recentTweets ||
    recentMentions ||
    youtubeVideos ||
    redditPosts ||
    githubUrl;

  return (
    <div className="space-y-16 pt-12">
      {hasSocialsData && (
        <div className="flex items-center">
          <h2 className="text-4xl font-medium">Company Socials</h2>
        </div>
      )}

      {/* Recent Posts on X */}
      {recentTweets && recentTweets.length > 0 && (
        <div className="space-y-4 opacity-0 animate-fade-up [animation-delay:200ms]">
          <h3 className="text-2xl font-normal text-gray-900">Recent Posts on X</h3>
          <RecentTweetsDisplay tweets={recentTweets} />
        </div>
      )}

      {/* Mentions on X */}
      {recentMentions && recentMentions.length > 0 && (
        <div className="space-y-4 opacity-0 animate-fade-up [animation-delay:200ms]">
          <h3 className="text-2xl font-normal text-gray-900">Company Mentions on X</h3>
          <RecentTweetsDisplay tweets={recentMentions} />
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
