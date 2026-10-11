export const shippingMethods = [
  {
    id: "fast",
    label: "Nhanh",
    description: "Giao trong 2 - 4 ngày làm việc",
    fee: 30000,
  },
  {
    id: "standard",
    label: "Tiêu chuẩn",
    description: "Giao trong 4 - 6 ngày làm việc",
    fee: 20000,
  },
];

export const codConfig = {
  fee: 30000,
  freeShipThreshold: 500000,
  note: "Phí ship COD = 30.000 VNĐ, Freeship cho đơn hàng từ 500.000 VNĐ",
};

export const shippingCountries = [
  { id: "vn", label: "Việt Nam" },
  { id: "sg", label: "Singapore" },
  { id: "other", label: "Khác" },
];

export const vietnamCities = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Nha Trang",
  "Huế",
  "Đà Lạt",
  "Biên Hòa",
  "Vũng Tàu",
];