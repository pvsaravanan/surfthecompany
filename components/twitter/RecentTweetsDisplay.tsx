import { useRef } from "react";
import { TwitterIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Tweet } from "react-tweet";
import { motion } from "framer-motion";
import { useState } from "react";

interface Tweet {
  id: string;
  url: string;
  title: string;
  author: string | null;
}

interface RecentTweetsDisplayProps {
  tweets: Tweet[];
}

export default function RecentTweetsDisplay({ tweets }: RecentTweetsDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!tweets || tweets.length === 0) return null;

  const validTweets = tweets.filter(tweet => {
    const statusMatch = tweet.url.match(/\/status\/(\d+)/);
    return statusMatch && statusMatch[1];
  });

  if (validTweets.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 374; // card width (350) + gap (24)
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full">
      <div className="relative group/scroll">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-white border border-gray-200 shadow-md p-2 rounded-full hover:bg-gray-50 transition-colors opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div 
          ref={scrollRef} 
          className="w-full overflow-x-auto py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <motion.div
            className="flex space-x-6 pb-6"
            drag="x"
            dragConstraints={{ left: -((validTweets.length * 400) - window.innerWidth), right: 0 }}
            dragElastic={0.3}
          >
            {validTweets.map((tweet, index) => (
              <motion.div
                key={tweet.id}
                className="flex-shrink-0 w-[350px] relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                data-theme="light"
              >
                <div className={`${isExpanded ? '' : 'max-h-[500px] overflow-hidden'}`}>
                  <Tweet 
                    id={tweet.url.match(/\/status\/(\d+)/)?.[1] || ''} 
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-white border border-gray-200 shadow-md p-2 rounded-full hover:bg-gray-50 transition-colors opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="flex justify-start mt-4 pl-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show full posts <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
} 