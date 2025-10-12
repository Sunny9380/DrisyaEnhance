import ImageComparisonSlider from '../ImageComparisonSlider'
import earringsWhiteBg from "@assets/WhatsApp Image 2025-10-12 at 14.02.54_bef9f90d_1760283307730.jpg";
import earringsDarkBg from "@assets/WhatsApp Image 2025-10-12 at 14.03.27_c425ce07_1760283310185.jpg";

export default function ImageComparisonSliderExample() {
  return (
    <div className="w-full max-w-2xl">
      <ImageComparisonSlider
        beforeImage={earringsWhiteBg}
        afterImage={earringsDarkBg}
        beforeLabel="Original"
        afterLabel="Enhanced"
      />
    </div>
  )
}
