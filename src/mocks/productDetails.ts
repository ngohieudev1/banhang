export type ProductDetail = {
  description: string;
  highlights: string[];
  rating: number;
  reviews: number;
  extraImages: string[];
};

export const brandSpec = {
  material: "Premium recycled vegan leather with soft cotton-twill lining",
  dimensions: "24 x 16 x 9 cm (L x H x W)",
  strapDrop: "Detachable and adjustable, 48\u2013110 cm drop",
  shipping: "Free shipping in Ho Chi Minh City from 450,000\u20AB. Standard delivery 2\u20135 working days nationwide.",
  warranty: "12-month hardware warranty. Free returns and exchanges within 7 days of delivery.",
};

export const detailRows: [string, string][] = [
  ["Dimensions", brandSpec.dimensions],
  ["Strap", brandSpec.strapDrop],
  ["Material", brandSpec.material],
  ["Closure", "Hidden magnetic closure"],
  ["Made in", "Vietnam"],
  ["Note", "Colours may vary slightly depending on your screen."],
];

export const legalRows: [string, string][] = [
  ["Brand", "CHAUTFIFTH"],
  ["Company", "CHAUTFIFTH COMPANY LIMITED"],
  ["Address", "66/3 Bui Thi Xuan Street, Tan Son Nhat Ward, Ho Chi Minh City, Vietnam"],
  ["Warranty", brandSpec.warranty],
];

export const strapOptions = [
  { id: "short", label: "Short strap" },
  { id: "long", label: "Long strap" },
  { id: "adjustable", label: "Adjustable" },
];

export const productDetails: Record<string, ProductDetail> = {
  "bag-y2k-pocket-l": {
    description:
      "Our best-loved Y2K silhouette in the roomy large size. Soft, slouchy and endlessly wearable, it folds under the arm and carries a day's worth of essentials without ever losing its relaxed shape.",
    highlights: [
      "Slouchy large shoulder silhouette",
      "Reinforced dual top handles",
      "Hidden magnetic closure with inner zip pocket",
    ],
    rating: 4.8,
    reviews: 214,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20neutral%20oversized%20coat%20holding%20a%20dark%20brown%20slouchy%20leather%20shoulder%20bag%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20calm%20soft%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-01&orientation=portrait",
    ],
  },
  "bag-c5-pocket-s": {
    description:
      "A compact shoulder bag finished with delicate lace trim and a pearl-button strap. Feminine and light, it is the easiest way to soften a tailored look.",
    highlights: [
      "Compact shoulder size",
      "Detachable lace-trim strap",
      "Soft lined interior with card slip",
    ],
    rating: 4.7,
    reviews: 132,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20cream%20knit%20sweater%20holding%20a%20soft%20pink%20small%20lace-trim%20leather%20shoulder%20bag%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-02&orientation=portrait",
    ],
  },
  "bag-mini-flower": {
    description:
      "Playful checked mini bag with a sculpted round handle. Small but mighty, it holds your phone, cardholder and lipstick for evenings out.",
    highlights: [
      "Checked woven texture",
      "Sculpted round top handle",
      "Fits phone, cards and small essentials",
    ],
    rating: 4.6,
    reviews: 88,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20black%20slip%20dress%20holding%20a%20small%20black%20checked%20mini%20handbag%20with%20round%20top%20handle%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-03&orientation=portrait",
    ],
  },
  "bag-medium-flower-2-straps": {
    description:
      "A grainy leather tote with two adjustable straps that switch from shoulder to crossbody in seconds. Structured enough for work, soft enough for weekends.",
    highlights: [
      "Two adjustable detachable straps",
      "Grainy vegan leather finish",
      "Interior zip and slip pockets",
    ],
    rating: 4.9,
    reviews: 176,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20beige%20tailored%20blazer%20holding%20a%20deep%20red%20grainy%20leather%20medium%20tote%20bag%20with%20two%20straps%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-04&orientation=portrait",
    ],
  },
  "bag-y2k-cruise": {
    description:
      "The Y2K CRUISE pairs a deep red hue with a single curved handle for a clean, confident line. Understated luxury for day-to-night dressing.",
    highlights: [
      "Single curved statement handle",
      "Deep red smooth finish",
      "Suede-lined interior pocket",
    ],
    rating: 4.7,
    reviews: 104,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20neutral%20trench%20coat%20holding%20a%20dark%20red%20slouchy%20leather%20shoulder%20bag%20with%20curved%20handle%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-05&orientation=portrait",
    ],
  },
  "bag-c5-pocket-m": {
    description:
      "Our C5-POCKET in medium, shaped from smooth leather with a classic top handle. A quiet everyday bag that pairs with absolutely everything.",
    highlights: [
      "Medium structured silhouette",
      "Classic single top handle",
      "Magnetic flap with zip pocket",
    ],
    rating: 4.8,
    reviews: 145,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20soft%20cream%20suit%20holding%20a%20rich%20brown%20smooth%20leather%20medium%20handbag%20with%20top%20handle%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-06&orientation=portrait",
    ],
  },
  "bag-bakery-box": {
    description:
      "Boxy, butter-yellow and just the right amount of whimsical. The BAKERY BOX keeps its shape all day and adds a soft pop of colour to neutral outfits.",
    highlights: [
      "Structured box silhouette",
      "Short grab handle",
      "Rigid base that holds its shape",
    ],
    rating: 4.6,
    reviews: 97,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20beige%20knit%20dress%20holding%20a%20butter%20yellow%20structured%20box%20shape%20handbag%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-07&orientation=portrait",
    ],
  },
  "bag-y2k-pocket-m": {
    description:
      "The Y2K POCKET in medium, with the same drapey chocolate finish in a size that sits neatly under the arm for everyday errands.",
    highlights: [
      "Medium slouchy silhouette",
      "Soft draped vegan leather",
      "Interior zip pocket",
    ],
    rating: 4.8,
    reviews: 158,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20cream%20oversized%20shirt%20holding%20a%20medium%20brown%20chocolate%20slouchy%20leather%20bag%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-08&orientation=portrait",
    ],
  },
  "bag-2-face-s": {
    description:
      "A two-tone small bag with a curved handle, contrasting colour panels and a compact interior. Effortless colour blocking for the everyday.",
    highlights: [
      "Two-tone colour block panels",
      "Curved comfortable handle",
      "Compact interior with slip pocket",
    ],
    rating: 4.7,
    reviews: 91,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20sand%20linen%20set%20holding%20a%20two%20tone%20cream%20and%20butter%20yellow%20small%20leather%20handbag%20with%20curved%20handle%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-09&orientation=portrait",
    ],
  },
  "bag-c2-pocket-hobo-l": {
    description:
      "The C2-POCKET HOBO in large is an easy crescent shoulder bag with visible topstitching and a single strap that stays put all day.",
    highlights: [
      "Large crescent hobo shape",
      "Single wide shoulder strap",
      "Contrast topstitch detailing",
    ],
    rating: 4.8,
    reviews: 167,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20warm%20grey%20wool%20coat%20holding%20a%20dark%20beige%20large%20hobo%20shoulder%20bag%20with%20single%20strap%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-10&orientation=portrait",
    ],
  },
  "bag-butterfly": {
    description:
      "Sculptural and rounded, the BUTTERFLY features a looping handle that turns a simple bag into a soft statement piece.",
    highlights: [
      "Sculptural rounded body",
      "Looping top handle",
      "Smooth matte finish",
    ],
    rating: 4.7,
    reviews: 112,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20black%20minimal%20dress%20holding%20a%20black%20rounded%20leather%20handbag%20with%20sculptural%20curved%20top%20handle%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-11&orientation=portrait",
    ],
  },
  "bag-mini-c2-pocket-hobo": {
    description:
      "Our C2-POCKET HOBO shrunk down into a mini, printed with a playful pink leopard pattern for a fun, retro accent.",
    highlights: [
      "Mini hobo silhouette",
      "Pink leopard print",
      "Short curved shoulder handle",
    ],
    rating: 4.9,
    reviews: 203,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20cream%20slip%20dress%20holding%20a%20pink%20leopard%20print%20mini%20hobo%20bag%20with%20short%20curved%20handle%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-12&orientation=portrait",
    ],
  },
  "bag-2-face-m": {
    description:
      "The 2-FACE in medium brings together two warm neutrals under a graceful arched handle, quiet, considered and endlessly versatile.",
    highlights: [
      "Two-tone medium silhouette",
      "Arched structured handle",
      "Interior organisation pocket",
    ],
    rating: 4.7,
    reviews: 86,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20dark%20beige%20knitted%20top%20holding%20a%20dark%20beige%20medium%20two%20tone%20leather%20handbag%20with%20arched%20handle%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-13&orientation=portrait",
    ],
  },
  "bag-haso-basket-art": {
    description:
      "Part of the Art Edition, HASO BASKET is woven from grainy leather in a basket shape with a firm base. Equal parts practical and collectible.",
    highlights: [
      "Basket-woven grain leather",
      "Firm structured base",
      "Art Edition numbered label",
    ],
    rating: 4.8,
    reviews: 74,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20natural%20linen%20shirt%20holding%20a%20beige%20grain%20leather%20basket%20shape%20bag%20with%20structured%20base%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-14&orientation=portrait",
    ],
  },
  "bag-crescent-moon": {
    description:
      "A slim crescent shoulder bag in deep red with a delicate thin strap. Minimal, modern and made to move with you.",
    highlights: [
      "Slim crescent shape",
      "Delicate thin shoulder strap",
      "Magnetic top closure",
    ],
    rating: 4.6,
    reviews: 69,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20black%20long%20coat%20holding%20a%20dark%20red%20crescent%20moon%20shape%20shoulder%20bag%20with%20thin%20strap%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-15&orientation=portrait",
    ],
  },
  "bag-c5-pocket-tie-s": {
    description:
      "The C5-POCKET TIE swaps the classic handle for a knotted tie detail, a quiet twist on a signature shape in soft sand beige.",
    highlights: [
      "Knotted tie handle detail",
      "Small structured silhouette",
      "Soft sand beige finish",
    ],
    rating: 4.8,
    reviews: 121,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20warm%20taupe%20blazer%20holding%20a%20sand%20beige%20small%20leather%20bag%20with%20knotted%20tie%20handle%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-16&orientation=portrait",
    ],
  },
  "bag-oversize-flower": {
    description:
      "An oversized canvas tote built for the everyday haul. Roomy, lightweight and slouchy, it goes from market to studio without a second thought.",
    highlights: [
      "Oversized tote capacity",
      "Lightweight canvas weave",
      "Two durable carry handles",
    ],
    rating: 4.7,
    reviews: 139,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20neutral%20oversized%20shirt%20holding%20a%20large%20brown%20canvas%20tote%20bag%20with%20two%20handles%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-17&orientation=portrait",
    ],
  },
  "bag-mini-y2k-pocket": {
    description:
      "The fan favourite Y2K POCKET in a mini size, in cream with a pink leopard trim for a soft, playful finish.",
    highlights: [
      "Mini slouchy silhouette",
      "Pink leopard trim detailing",
      "Interior slip pocket",
    ],
    rating: 4.9,
    reviews: 188,
    extraImages: [
      "https://readdy.ai/api/search-image?query=Editorial%20fashion%20lifestyle%20photograph%20of%20a%20model%20in%20a%20cream%20cropped%20cardigan%20holding%20a%20white%20cream%20small%20slouchy%20leather%20bag%20with%20pink%20leopard%20trim%20against%20a%20soft%20warm%20beige%20seamless%20studio%20backdrop%20gentle%20diffused%20natural%20light%20luxury%20minimal%20catalog%20aesthetic&width=900&height=1120&seq=cf-dtl-18&orientation=portrait",
    ],
  },
};