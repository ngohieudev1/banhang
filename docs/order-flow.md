# Order Flow

Tài liệu này mô tả các tính năng order hiện có của hệ thống storefront + admin.

## 1. Customer checkout

Customer hoặc guest có thể:

1. Chọn product/SKU trên storefront.
2. Thêm sản phẩm vào cart.
3. Checkout bằng COD.
4. Gửi order qua `POST /api/storefront-orders`.

Backend kiểm tra product/SKU, giá, số lượng và tồn kho trước khi tạo order. Tồn kho được cập nhật atomic để tránh oversell khi nhiều checkout chạy đồng thời.

Order mới được tạo với:

```text
status: processing
fulfillmentStatus: processing
inventoryReservedAt
inventoryExpiresAt
orderNumber
checkoutKey
```

`checkoutKey` dùng để chống tạo trùng order khi client retry request.

## 2. Customer order tracking

- Danh sách order: `/orders`
- Chi tiết order: `/orders/:id`
- Guest tìm order: `/find-order`
- Customer chỉ xem được order thuộc tài khoản của mình.
- Guest chỉ truy cập order bằng thông tin tìm kiếm hợp lệ.

Chi tiết order gồm sản phẩm, SKU, số lượng, đơn giá, tổng tiền, địa chỉ giao hàng, phương thức giao hàng và trạng thái fulfillment.

## 3. Order statuses

### Fulfillment status

```text
processing  -> confirmed -> shipping -> completed
processing  -> cancelled
confirmed   -> cancelled
```

Các trạng thái được hỗ trợ:

- `processing`: order mới, đang xử lý.
- `confirmed`: admin đã xác nhận.
- `shipping`: đang giao hàng.
- `completed`: giao thành công.
- `cancelled`: đã huỷ hoặc bị huỷ do inventory hết hạn.

### General status

`status` được đồng bộ từ `fulfillmentStatus`:

- `completed` → `status: completed`
- `cancelled` → `status: cancelled`
- Các trạng thái còn lại → `status: processing`

## 4. Admin operations

Admin có thể:

- Xem danh sách và chi tiết order trong Payload Admin.
- Cập nhật fulfillment status.
- Cập nhật nhiều order cùng lúc.
- Export order.
- Import order bằng CSV.
- Xem các field inventory reservation/release.

Bulk status endpoint:

```text
POST /api/orders-bulk-status
```

Request nhận `ids` hoặc `orderNumbers`, tối đa 100 order mỗi lần, cùng `fulfillmentStatus` hợp lệ.

## 5. Inventory reservation và expiry

Khi checkout thành công:

- Product/SKU bị trừ inventory.
- Order lưu thời điểm reserve.
- Order lưu thời điểm expiry.

Release order hết hạn:

```text
POST /api/release-expired-inventory
```

Endpoint quét order đang ở `processing` hoặc `confirmed` nhưng đã quá `inventoryExpiresAt`, sau đó:

1. Hoàn inventory về product/SKU.
2. Đánh dấu fulfillment là `cancelled`.
3. Đồng bộ `status` thành `cancelled`.
4. Lưu thời điểm release.

## 6. Import/export

Order import hỗ trợ CSV theo nhóm dòng order. Backend validate product/SKU, số lượng, giá và trạng thái trước khi tạo order.

Các endpoint liên quan:

```text
POST /api/orders-import.csv
GET  /api/orders-import-template.csv
GET  /api/orders-export.csv
```

## 7. Validation và edge cases

Backend từ chối:

- Product không tồn tại.
- SKU không tồn tại.
- Giá không hợp lệ hoặc bằng 0.
- Số lượng nhỏ hơn hoặc bằng 0.
- Inventory không đủ.
- Checkout key bị duplicate.
- Chuyển sang fulfillment status không được hỗ trợ.
- Bulk request vượt quá 100 order.

Frontend hiện đã:

- Disable Add to cart khi SKU/product hết inventory.
- Hiển thị trạng thái stock.
- Ưu tiên giá SKU, sau đó tới giá product VND.

## 8. Quyền truy cập

- Customer không được truy cập `/admin`.
- Customer chỉ đọc order của chính mình.
- Admin được quản lý order và cập nhật trạng thái.
- Endpoint bulk status, import/export và release inventory yêu cầu quyền admin.

## 9. Chưa có

Endpoint release inventory đã có nhưng chưa được gọi tự động bằng cron/worker. Production cần thêm scheduler định kỳ để tự động chạy `POST /api/release-expired-inventory`.
