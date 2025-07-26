import Branding from "@/components/Branding/Branding";
import Category from "@/components/Category/Category";
import LatestArticlesSlider from "@/components/LatestArticlesSlider/LatestArticlesSlider";
import NewsletterSection from "@/components/NewsletterSection/NewsletterSection";
import ProductsCard from "@/components/productsCard/ProductsCard";
import Quality from "@/components/Quality/Quality";
import Slider from "@/components/Slider/Slider";
import TechnicalSpecifications from "@/components/TechnicalSpecifications/TechnicalSpecifications";

export default function Home() {
  return (
    <>
      <Slider />
      <Category />
      <ProductsCard />
      <Quality />
      <LatestArticlesSlider />
      <Branding />
      <TechnicalSpecifications />
      <NewsletterSection />
    </>
  );
}
