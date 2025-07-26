"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import ArticlesSkeleton from "../ui/Skeletons/ArticlesSkeleton/ArticlesSkeleton";

interface Article {
  slug: string;
  _id: string;
  createdAt: string;
  image: string;
  category: string[];
  title: string;
  author: string;
  content: string;
  authorImage: string;
}

export default function LatestArticlesSlider() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // console.log("common url",process.env.NEXTAUTH_URL)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data = await response.json();
        console.log(data.data);
        setArticles(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (error) {
    return (
      <div className="w-11/12 mx-auto py-20 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
          Our Latest Blogs
        </h2>
        <div className="text-center py-10 text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-11/12 mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
        Our Latest Blogs
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {Array.from({ length: 3 }, (_, i) => i + 1).map((_, i) => (
            <ArticlesSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          breakpoints={{
            480: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="relative"
        >
          {articles?.map((article, index) => (
            <SwiperSlide key={index}>
              <div className="rounded-lg overflow-hidden shadow-lg flex flex-col h-full my-3">
                <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h">
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-white text-black px-3 py-1 text-sm font-bold">
                    {article.createdAt}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <span className="bg-[#3C9E26] text-white w-13 mx-auto px-2 py-1 text-xs text-center rounded">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-bold mb-2 text-center">
                    {article.title}
                  </h3>
                  <div className="flex gap-2 items-center justify-center">
                    <Image
                      src={article.authorImage}
                      alt="authorImage"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <p className="text-sm text-gray-600 font-semibold mb-4 text-center">
                      Posted by {article.author}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 flex-grow text-center">
                    {article.content.length > 100
                      ? `${article.content.substring(0, 100)}...`
                      : article.content}
                  </p>

                  <Link
                    href={`/article/${article.slug}`}
                    className="mt-4 text-[#3C9E26] text-md font-semibold text-center hover:underline"
                  >
                    CONTINUE READING
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <div className="flex justify-center items-center h-40 text-red-500 font-semibold">
        <Link href={"/blogs"}>
          <button className=" bg-[#3C9E26] text-white py-2 px-6 rounded-md hover:bg-black cursor-pointer">
            More Blogs
          </button>
        </Link>
      </div>
    </div>
  );
}
