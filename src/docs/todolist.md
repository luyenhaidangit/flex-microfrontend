# TODO List & Bug Reports

## 🐛 Known Bugs (Chưa cần fix ngay)

### Bug: Duyệt bản ghi bị nhầm ID
**Mô tả chi tiết:**
- **Chức năng:** Màn hình chờ duyệt (Approval Pending Screen)
- **Vai trò:** Frontend Role
- **Các bước tái hiện:**
  1. Vào màn hình chờ duyệt
  2. Bấm nút "Duyệt" cho bản ghi thứ nhất → Duyệt thành công
  3. Bấm nút "Duyệt" cho bản ghi thứ hai → **BUG**: Hệ thống vẫn lấy ID của bản ghi thứ nhất thay vì bản ghi thứ hai

**Nguyên nhân có thể:**
- ID không được cập nhật đúng sau khi duyệt bản ghi đầu tiên
- State management bị conflict giữa các bản ghi
- Event handler không bind đúng ID cho từng button duyệt

**Ảnh hưởng:**
- Duyệt nhầm bản ghi không mong muốn
- Dữ liệu bị sai lệch
- Trải nghiệm người dùng kém

**Lưu ý khi code chức năng khác:**
- Cần kiểm tra kỹ việc bind ID cho từng action button
- Đảm bảo state được reset/cập nhật đúng sau mỗi action
- Test kỹ flow duyệt nhiều bản ghi liên tiếp

---

## 📋 TODO Items

### High Priority
- [ ] Fix bug duyệt bản ghi (khi cần)

### Medium Priority
- [ ] Cải thiện UX cho màn hình chờ duyệt
- [ ] Thêm loading state cho các action

### Low Priority
- [ ] Tối ưu performance
- [ ] Thêm unit tests

---

## 📝 Notes
- Các bug trong phần "Known Bugs" chưa cần fix ngay nhưng cần lưu ý khi phát triển tính năng mới
- Ưu tiên fix theo thứ tự High → Medium → Low Priority
