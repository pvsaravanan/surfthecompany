import { useRef } from "react";
import { motion } from "framer-motion";
import { FaReddit } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RedditPost {
  url: string;
  title: string;
}

interface RedditDisplayProps {
  posts: RedditPost[];
}

export default function RedditDisplay({ posts }: RedditDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!posts || posts.length === 0) return null;

  const extractSubreddit = (url: string) => {
    const match = url.match(/reddit\.com\/r\/([^/]+)/);
    return match ? match[1] : 'reddit';
  };

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
    <div>
      <h2 className="text-2xl font-normal mb-6">Company Mentions on Reddit</h2>
      
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
            className="flex space-x-6"
            drag="x"
            dragConstraints={{ left: -((posts.length * 400) - window.innerWidth), right: 0 }}
            dragElastic={0.3}
          >
            {posts.map((post, index) => (
              <motion.a
                key={index}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[350px] bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="text-[#FF4500]">
                      <FaReddit size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-600">r/{extractSubreddit(post.url)}</span>
                  </div>
                  <p className="text-lg line-clamp-3">
                    {post.title}
                  </p>
                </div>
              </motion.a>
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
    </div>
  );
}