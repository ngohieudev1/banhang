export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductSku = {
  id: string;
  code: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  color?: ProductColor;
  inventory: number;
  description?: string;
  highlights: string[];
  specs: [string, string][];
};

export type Product = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  hoverImage: string;
  colors: ProductColor[];
  tag?: string;
  skus?: ProductSku[];
};

export const formatVnd = (value: number): string =>
  `${value.toLocaleString("en-US")}\u20AB`;

export const collectionMeta = {
  title: "Bags",
  subtitle: "Handbags and accessories designed in Vietnam.",
  breadcrumb: "chautfifth.com",
  totalItems: 128,
};

export const collectionFilters = [
  { id: "all", label: "All" },
  { id: "new", label: "New Arrivals" },
  { id: "best", label: "Best Sellers" },
  { id: "mini", label: "Mini Bags" },
  { id: "sale", label: "On Sale" },
];

export const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "best-selling", label: "Best selling" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "newest", label: "Newest" },
];

export const products: Product[] = [
  {
    id: "bag-y2k-pocket-l",
    name: "Bag Y2K POCKET",
    price: 1795000,
    compareAtPrice: 2195000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20brown%20slouchy%20leather%20shoulder%20bag%20with%20two%20top%20handles%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20ultra%20sharp%20detail%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-01&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20brown%20slouchy%20leather%20shoulder%20bag%20back%20view%20showing%20leather%20grain%20texture%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-01b&orientation=portrait",
    colors: [
      { name: "Brown Choco", hex: "#5a3a29" },
      { name: "Brown Leopard", hex: "#8a6a45" },
    ],
  },
  {
    id: "bag-c5-pocket-s",
    name: "Bag C5-POCKET (S)",
    price: 1345000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20soft%20pink%20small%20leather%20shoulder%20bag%20with%20lace%20trim%20and%20short%20strap%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20delicate%20feminine%20luxury%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-02&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20soft%20pink%20small%20leather%20shoulder%20bag%20side%20profile%20with%20lace%20trim%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20delicate%20feminine%20luxury%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-02b&orientation=portrait",
    colors: [
      { name: "Pink Leopard", hex: "#e8a5b0" },
      { name: "Lace", hex: "#f4e6e2" },
    ],
    tag: "New",
  },
  {
    id: "bag-mini-flower",
    name: "Bag MINI FLOWER",
    price: 895000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20small%20black%20checked%20pattern%20mini%20handbag%20with%20round%20top%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-03&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20small%20black%20checked%20pattern%20mini%20handbag%20angled%20three%20quarter%20view%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-03b&orientation=portrait",
    colors: [{ name: "Black Checked", hex: "#2b2b2b" }],
  },
  {
    id: "bag-medium-flower-2-straps",
    name: "Bag MEDIUM FLOWER 2 STRAPS",
    price: 945000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20deep%20red%20grainy%20leather%20medium%20tote%20bag%20with%20two%20adjustable%20straps%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-04&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20deep%20red%20grainy%20leather%20medium%20tote%20bag%20side%20profile%20detail%20shot%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-04b&orientation=portrait",
    colors: [{ name: "Red Grain", hex: "#8e2b2b" }],
  },
  {
    id: "bag-y2k-cruise",
    name: "Bag Y2K CRUISE",
    price: 1595000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20red%20slouchy%20leather%20shoulder%20bag%20with%20single%20curved%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-05&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20red%20slouchy%20leather%20shoulder%20bag%20rear%20angle%20view%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-05b&orientation=portrait",
    colors: [{ name: "Dark Red", hex: "#6f1f24" }],
  },
  {
    id: "bag-c5-pocket-m",
    name: "Bag C5-POCKET (M)",
    price: 1395000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20rich%20brown%20smooth%20leather%20medium%20handbag%20with%20top%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-06&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20rich%20brown%20smooth%20leather%20medium%20handbag%20angled%20side%20view%20close%20up%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-06b&orientation=portrait",
    colors: [
      { name: "Brown", hex: "#6b4226" },
      { name: "Chestnut", hex: "#4a2c1a" },
    ],
  },
  {
    id: "bag-bakery-box",
    name: "Bag BAKERY BOX",
    price: 1295000,
    compareAtPrice: 1595000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20butter%20yellow%20structured%20box%20shape%20handbag%20with%20short%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-07&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20butter%20yellow%20structured%20box%20handbag%20three%20quarter%20angle%20view%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-07b&orientation=portrait",
    colors: [
      { name: "Butter Yellow", hex: "#e9d79a" },
      { name: "Cream", hex: "#f2ece0" },
    ],
  },
  {
    id: "bag-y2k-pocket-m",
    name: "Bag Y2K POCKET (M)",
    price: 1695000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20medium%20brown%20chocolate%20slouchy%20leather%20bag%20with%20soft%20draped%20silhouette%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-08&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20medium%20brown%20chocolate%20slouchy%20leather%20bag%20side%20profile%20texture%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-08b&orientation=portrait",
    colors: [{ name: "Brown Choco", hex: "#573424" }],
  },
  {
    id: "bag-2-face-s",
    name: "Bag 2-FACE (S)",
    price: 1295000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20two%20tone%20cream%20and%20butter%20yellow%20small%20leather%20handbag%20with%20curved%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-09&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20two%20tone%20cream%20and%20butter%20yellow%20small%20leather%20handbag%20angled%20view%20close%20up%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-09b&orientation=portrait",
    colors: [
      { name: "Butter Yellow", hex: "#ead9a2" },
      { name: "Sand", hex: "#d9c7ab" },
    ],
  },
  {
    id: "bag-c2-pocket-hobo-l",
    name: "Bag C2-POCKET HOBO (L)",
    price: 1295000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20beige%20large%20hobo%20shoulder%20bag%20with%20soft%20crescent%20silhouette%20and%20single%20strap%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-10&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20beige%20large%20hobo%20shoulder%20bag%20side%20detail%20with%20visible%20stitching%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-10b&orientation=portrait",
    colors: [
      { name: "Dark Beige", hex: "#a08a72" },
      { name: "Taupe", hex: "#8a7862" },
    ],
  },
  {
    id: "bag-butterfly",
    name: "Bag BUTTERFLY",
    price: 1195000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20black%20rounded%20leather%20handbag%20with%20sculptural%20curved%20top%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20subtle%20contact%20shadow%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-11&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20black%20rounded%20leather%20handbag%20close%20up%20of%20curved%20handle%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-11b&orientation=portrait",
    colors: [
      { name: "Black", hex: "#1c1c1c" },
      { name: "Cream", hex: "#ece3d4" },
    ],
  },
  {
    id: "bag-mini-c2-pocket-hobo",
    name: "Bag MINI C2-POCKET HOBO",
    price: 1095000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20pink%20leopard%20print%20mini%20hobo%20bag%20with%20short%20curved%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-12&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20pink%20leopard%20print%20mini%20hobo%20bag%20side%20profile%20print%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-12b&orientation=portrait",
    colors: [{ name: "Pink Leopard", hex: "#dba8b2" }],
    tag: "Best seller",
  },
  {
    id: "bag-2-face-m",
    name: "Bag 2-FACE (M)",
    price: 1395000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20beige%20medium%20two%20tone%20leather%20handbag%20with%20arched%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-13&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20beige%20medium%20two%20tone%20leather%20handbag%20back%20panel%20view%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-13b&orientation=portrait",
    colors: [
      { name: "Dark Beige", hex: "#a3907a" },
      { name: "Cement", hex: "#9aa0a0" },
    ],
  },
  {
    id: "bag-haso-basket-art",
    name: "Bag HASO BASKET Art Edition",
    price: 1075000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20beige%20grain%20leather%20basket%20shape%20bag%20with%20structured%20base%20and%20top%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-14&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20beige%20grain%20leather%20basket%20bag%20three%20quarter%20angle%20view%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-14b&orientation=portrait",
    colors: [
      { name: "Dark Beige Grain", hex: "#b09a7e" },
      { name: "Cream", hex: "#ede4d6" },
    ],
  },
  {
    id: "bag-crescent-moon",
    name: "Bag CRESCENT MOON",
    price: 1195000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20red%20crescent%20moon%20shape%20shoulder%20bag%20with%20thin%20strap%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-15&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20dark%20red%20crescent%20moon%20shape%20bag%20side%20profile%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-15b&orientation=portrait",
    colors: [{ name: "Dark Red", hex: "#7c2028" }],
  },
  {
    id: "bag-c5-pocket-tie-s",
    name: "Bag C5-POCKET TIE (S)",
    price: 1395000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20sand%20beige%20small%20leather%20bag%20with%20knotted%20tie%20detail%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-16&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20sand%20beige%20small%20leather%20bag%20close%20up%20of%20knotted%20tie%20handle%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-16b&orientation=portrait",
    colors: [
      { name: "Sand Beige", hex: "#cbb99b" },
      { name: "Chocolate", hex: "#5f4230" },
    ],
    tag: "New",
  },
  {
    id: "bag-oversize-flower",
    name: "Bag OVERSIZE FLOWER",
    price: 1295000,
    compareAtPrice: 1495000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20large%20brown%20canvas%20tote%20bag%20with%20two%20handles%20and%20soft%20slouchy%20shape%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-17&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20large%20brown%20canvas%20tote%20bag%20side%20view%20showing%20fabric%20texture%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-17b&orientation=portrait",
    colors: [
      { name: "Brown", hex: "#6d4a2f" },
      { name: "Khaki", hex: "#9c8a68" },
    ],
  },
  {
    id: "bag-mini-y2k-pocket",
    name: "Bag Mini Y2K POCKET",
    price: 1595000,
    image:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20white%20cream%20small%20slouchy%20leather%20bag%20with%20pink%20leopard%20trim%20and%20short%20handle%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20gentle%20diffused%20lighting%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-18&orientation=portrait",
    hoverImage:
      "https://readdy.ai/api/search-image?query=Minimal%20e-commerce%20product%20photography%20of%20a%20white%20cream%20small%20slouchy%20leather%20bag%20close%20up%20pink%20leopard%20trim%20detail%2C%20centered%20on%20a%20seamless%20soft%20light%20grey%20studio%20background%2C%20luxury%20fashion%20catalog%20aesthetic&width=900&height=1120&seq=cf-bag-18b&orientation=portrait",
    colors: [
      { name: "White Cream", hex: "#eee6da" },
      { name: "Pink Leopard", hex: "#e0aab3" },
    ],
    tag: "Almost gone",
  },
];