import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { extractDisplayDomain } from '@/lib/utils';

interface NewsItem {
  url: string;
  title: string;
  image: string;
}

interface NewsDisplayProps {
  news: NewsItem[];
}

const NewsDisplay: React.FC<NewsDisplayProps> = ({ news }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);


  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 312; // md:w-72 (288) + gap (24)
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div ref={containerRef}>
      <h2 className="text-2xl font-normal mb-6">Latest News</h2>

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
            dragConstraints={{ left: -(Math.max(0, (news.length * 280) - containerWidth)), right: 0 }}
            dragElastic={0.3}
          >
            {news.map((item, index) => (
              <motion.a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-60 md:w-72 bg-white border rounded-none shadow-sm overflow-hidden transition-all hover:scale-105 hover:shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative h-32 md:h-40 w-full">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.onerror = null;
                        // Instead of loading a placeholder image, show a div with background color
                        imgElement.style.display = 'none';
                        imgElement.parentElement!.classList.add('bg-blue-100');
                        imgElement.parentElement!.innerHTML = `
                          <div class="flex items-center justify-center h-full text-gray-500 p-3 group-hover:text-brand-default">
                            ${item.title.slice(0, 50)}${item.title.length > 50 ? '...' : ''}
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                      <span className="px-4 text-center">
                        {item.title.slice(0, 50)}{item.title.length > 50 ? '...' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-normal line-clamp-2 mb-2">
                    {item.title}
                  </p>
                  <div className="text-sm text-gray-500 transition-colors">
                    {extractDisplayDomain(item.url)}
                  </div>
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
};

export default NewsDisplay;