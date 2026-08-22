export interface SubjectPreset {
  id: string;
  subject: string;
  grade: string;
  examType: string;
  durationMinutes: number;
  sampleRequirements: string;
  topics: string[];
}

export const SUBJECT_PRESETS: SubjectPreset[] = [
  {
    id: 'toan-12-gk1',
    subject: 'Toán học',
    grade: 'Lớp 12',
    examType: 'Giữa kì 1',
    durationMinutes: 90,
    topics: ['Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số', 'Vectơ và hệ tọa độ trong không gian'],
    sampleRequirements: `CHỦ ĐỀ 1: ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ
- Tính đơn điệu của hàm số:
  + Nhận biết: Nhận biết tính đồng biến, nghịch biến của hàm số trên một khoảng dựa vào dấu của đạo hàm cấp một hoặc đồ thị/bảng biến thiên.
  + Thông hiểu: Tìm các khoảng đơn điệu của các hàm số bậc ba, hàm phân thức bậc nhất/bậc nhất, bậc hai/bậc nhất.
  + Vận dụng: Tìm tham số m để hàm số đơn điệu trên một khoảng cho trước. Ứng dụng giải quyết bài toán thực tế.
- Cực trị của hàm số:
  + Nhận biết: Nhận biết điểm cực đại, điểm cực tiểu, giá trị cực trị từ bảng biến thiên hoặc đồ thị hàm số.
  + Thông hiểu: Tìm cực trị của hàm số đa thức, phân thức hữu tỉ.
  + Vận dụng: Bài toán cực trị chứa tham số, ứng dụng tối ưu hóa trong kinh tế và đời sống.
- Giá trị lớn nhất, giá trị nhỏ nhất của hàm số:
  + Nhận biết & Thông hiểu: Tìm GTLN, GTNN của hàm số trên một đoạn [a; b] hoặc một khoảng.
  + Vận dụng: Bài toán tối ưu thực tế (chi phí, thể tích, diện tích).
- Đường tiệm cận của đồ thị hàm số:
  + Nhận biết: Xác định tiệm cận đứng, tiệm cận ngang, tiệm cận xiên từ bảng biến thiên hoặc đồ thị.
  + Thông hiểu: Tìm phương trình các đường tiệm cận của hàm số phân thức.

CHỦ ĐỀ 2: VECTƠ VÀ HỆ TỌA ĐỘ TRONG KHÔNG GIAN
- Vectơ trong không gian:
  + Nhận biết: Khái niệm vectơ, độ dài vectơ, vectơ cùng phương, cùng hướng, vectơ không.
  + Thông hiểu: Các phép toán cộng, trừ vectơ, nhân vectơ với một số, tích vô hướng của hai vectơ trong không gian.
- Hệ tọa độ trong không gian:
  + Nhận biết: Tọa độ của điểm, tọa độ của vectơ đối với hệ trục Oxyz.
  + Thông hiểu: Tính độ dài đoạn thẳng, góc giữa hai vectơ, tích vô hướng, tọa độ trung điểm, trọng tâm tam giác.`
  },
  {
    id: 'vat-ly-12-ck1',
    subject: 'Vật lí',
    grade: 'Lớp 12',
    examType: 'Cuối kì 1',
    durationMinutes: 50,
    topics: ['Vật lí nhiệt', 'Khí lí tưởng'],
    sampleRequirements: `CHỦ ĐỀ 1: VẬT LÍ NHIỆT
- Sự chuyển thể:
  + Nhận biết: Mô tả được các quá trình chuyển thể: nóng chảy, đông đặc, bay hơi, ngưng tụ, thăng hoa.
  + Thông hiểu: Giải thích được các hiện tượng nhiệt trong tự nhiên và công nghệ dựa trên mô hình động học phân tử.
- Nhiệt lượng và nhiệt dung riêng:
  + Nhận biết: Định nghĩa nhiệt dung riêng, nhiệt nóng chảy riêng, nhiệt hóa hơi riêng và đơn vị đo.
  + Thông hiểu: Viết và giải thích công thức tính nhiệt lượng Q = mcΔT, Q = Lm, Q = λm.
  + Vận dụng: Giải bài toán truyền nhiệt và cân bằng nhiệt.

CHỦ ĐỀ 2: KHÍ LÍ TƯỞNG
- Mô hình động học phân tử chất khí:
  + Nhận biết: Các giả thuyết của thuyết động học phân tử chất khí.
  + Thông hiểu: Giải thích áp suất chất khí tác dụng lên thành bình.
- Các định luật chất khí và phương trình trạng thái:
  + Nhận biết: Định luật Boyle, định luật Charles.
  + Thông hiểu: Vận dụng phương trình Clapeyron - Mendeleev pV = nRT.
  + Vận dụng: Tính toán các thông số trạng thái của khối khí trong quá trình biến đổi.`
  },
  {
    id: 'hoa-hoc-12-gk1',
    subject: 'Hóa học',
    grade: 'Lớp 12',
    examType: 'Giữa kì 1',
    durationMinutes: 50,
    topics: ['Este - Lipit', 'Carbohydrate'],
    sampleRequirements: `CHỦ ĐỀ 1: ESTE - LIPIT
- Este:
  + Nhận biết: Khái niệm, công thức tổng quát, danh pháp este đơn chức no mạch hở.
  + Thông hiểu: Tính chất vật lí, tính chất hóa học đặc trưng (phản ứng thủy phân trong môi trường axit và môi trường kiềm - xà phòng hóa).
  + Vận dụng: Viết đồng phân este, bài toán đốt cháy và thủy phân este.
- Lipit và chất béo:
  + Nhận biết: Khái niệm lipit, chất béo, axit béo phổ biến (palmitic, stearic, oleic).
  + Thông hiểu: Phản ứng xà phòng hóa chất béo, ứng dụng và vai trò dinh dưỡng của chất béo.

CHỦ ĐỀ 2: CARBOHYDRATE
- Glucose và Fructose:
  + Nhận biết: Công thức phân tử, cấu tạo dạng mạch hở và mạch vòng, tính chất vật lí.
  + Thông hiểu: Tính chất hóa học: phản ứng tráng bạc, phản ứng với Cu(OH)2, phản ứng lên men rượu của glucose.
- Saccharose và Maltose:
  + Nhận biết: Cấu tạo phân tử, phản ứng thủy phân.
- Tinh bột và Cellulose:
  + Nhận biết: Khái niệm, tính chất vật lí, phản ứng màu của tinh bột với iot.
  + Thông hiểu: Phản ứng thủy phân tinh bột và cellulose, ứng dụng trong công nghiệp tơ sợi và thực phẩm.`
  },
  {
    id: 'ngu-van-10-ck1',
    subject: 'Ngữ văn',
    grade: 'Lớp 10',
    examType: 'Cuối kì 1',
    durationMinutes: 90,
    topics: ['Đọc hiểu văn bản thần thoại/sử thi', 'Viết bài văn nghị luận xã hội/văn học'],
    sampleRequirements: `PHẦN 1: ĐỌC HIỂU (4,0 - 6,0 điểm)
- Văn bản Thần thoại hoặc Sử thi:
  + Nhận biết: Xác định thể loại, nhân vật chính, không gian, thời gian nghệ thuật, ngôi kể, chi tiết tiêu biểu.
  + Thông hiểu: Phân tích ý nghĩa biểu tượng của các hình tượng thần thoại/anh hùng sử thi; giải thích thông điệp hoặc quan niệm nhân sinh của người xưa.
  + Vận dụng: Nhận xét về khát vọng của con người thời cổ đại; liên hệ với thực tiễn cuộc sống hiện nay.

PHẦN 2: VIẾT (4,0 - 6,0 điểm)
- Nghị luận xã hội: Viết đoạn văn/bài văn nghị luận về một vấn đề đời sống, tư tưởng đạo lí hoặc lối sống của giới trẻ.
- Nghị luận văn học: Phân tích, đánh giá một nét đặc sắc về nội dung hoặc hình thức nghệ thuật của đoạn trích/tác phẩm thần thoại, sử thi đã học.`
  },
  {
    id: 'tieng-anh-12-gk1',
    subject: 'Tiếng Anh',
    grade: 'Lớp 12',
    examType: 'Giữa kì 1',
    durationMinutes: 50,
    topics: ['Life stories', 'A multicultural world', 'Grammar & Vocabulary'],
    sampleRequirements: `LANGUAGE & GRAMMAR:
- Phonetics: Pronunciation of -ed, -s/es; Word stress of 2 and 3-syllable words.
- Vocabulary: Words related to life stories of famous figures, multicultural lifestyles, diversity and traditions.
- Grammar:
  + Past Simple vs. Past Continuous with when/while.
  + Articles: a, an, the, zero article.
  + Relative clauses (defining and non-defining).

READING COMPREHENSION:
- Reading text about inspirational life journeys or cultural celebrations.
- Identifying main ideas, specific details, pronoun references, and guessing word meaning in context.

WRITING & COMMUNICATION:
- Sentence transformation, cloze test, situational exchanges, error identification.`
  },
  {
    id: 'khtn-8-gk1',
    subject: 'Khoa học tự nhiên',
    grade: 'Lớp 8',
    examType: 'Giữa kì 1',
    durationMinutes: 60,
    topics: ['Biến đổi hóa học và phản ứng hóa học', 'Khối lượng riêng và áp suất'],
    sampleRequirements: `PHẦN HÓA HỌC:
- Biến đổi vật lí và biến đổi hóa học:
  + Nhận biết: Phân biệt hiện tượng vật lí và hiện tượng hóa học.
  + Thông hiểu: Dấu hiệu nhận biết có phản ứng hóa học xảy ra.
- Định luật bảo toàn khối lượng và phương trình hóa học:
  + Nhận biết: Phát biểu định luật bảo toàn khối lượng.
  + Thông hiểu: Lập phương trình hóa học của các phản ứng đơn giản.
  + Vận dụng: Tính khối lượng các chất theo định luật bảo toàn khối lượng.
- Mol và tỉ khối của chất khí:
  + Thông hiểu: Tính khối lượng mol, thể tích mol chất khí ở điều kiện chuẩn (25°C, 1 bar).

PHẦN VẬT LÍ:
- Khối lượng riêng:
  + Nhận biết: Công thức tính khối lượng riêng D = m/V và đơn vị đo.
  + Vận dụng: Tính khối lượng, thể tích hoặc khối lượng riêng của vật thể.
- Tác dụng của áp lực và áp suất:
  + Nhận biết: Khái niệm áp lực, áp suất p = F/S.
  + Thông hiểu & Vận dụng: Giải thích các hiện tượng tăng/giảm áp suất trong đời sống.`
  }
];

export const SUBJECT_LIST = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Lịch sử',
  'Địa lí',
  'Giáo dục kinh tế và pháp luật',
  'Tin học',
  'Công nghệ',
  'Khoa học tự nhiên (THCS)',
  'Lịch sử & Địa lí (THCS)',
  'Giáo dục công dân (THCS)'
];

export const GRADE_LIST = [
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12',
  'Ôn thi Tốt nghiệp THPT'
];

export const EXAM_TYPE_LIST = [
  'Kiểm tra thường xuyên (15 phút)',
  'Kiểm tra định kì 1 tiết',
  'Kiểm tra giữa học kì 1',
  'Kiểm tra cuối học kì 1',
  'Kiểm tra giữa học kì 2',
  'Kiểm tra cuối học kì 2',
  'Đề thi thử Tốt nghiệp THPT',
  'Khảo sát chất lượng đầu năm'
];
