import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser with large limit for documents (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Database (Synced with clients)
let teachersDb: Array<{
  id: string;
  fullName: string;
  email: string;
  subject: string;
  gradeLevel: string;
  schoolName: string;
  createdAt: string;
  avatarColor: string;
}> = [
  {
    id: 't-1',
    fullName: 'Thầy Nguyễn Văn An',
    email: 'nguyenvanan.toan@gmail.com',
    subject: 'Toán học',
    gradeLevel: 'Lớp 12',
    schoolName: 'THPT Chuyên Hà Nội - Amsterdam',
    createdAt: '2025-01-15T08:30:00.000Z',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 't-2',
    fullName: 'Cô Trần Thị Mai',
    email: 'maitran.van@gmail.com',
    subject: 'Ngữ văn',
    gradeLevel: 'Lớp 10',
    schoolName: 'THPT Chu Văn An (Hà Nội)',
    createdAt: '2025-02-01T09:15:00.000Z',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 't-3',
    fullName: 'Thầy Lê Hoàng Nam',
    email: 'namle.vatly@gmail.com',
    subject: 'Vật lí',
    gradeLevel: 'Lớp 12',
    schoolName: 'THPT Chuyên Lê Hồng Phong (TP.HCM)',
    createdAt: '2025-02-10T14:20:00.000Z',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 't-4',
    fullName: 'Cô Phạm Thị Ngọc Lan',
    email: 'ngoclan.hoahoc@gmail.com',
    subject: 'Hóa học',
    gradeLevel: 'Lớp 11',
    schoolName: 'THPT Chuyên Quốc Học Huế',
    createdAt: '2025-02-18T11:45:00.000Z',
    avatarColor: 'bg-rose-600',
  },
  {
    id: 't-5',
    fullName: 'Thầy Vũ Đình Trọng',
    email: 'trongvu.sinhhoc@gmail.com',
    subject: 'Sinh học',
    gradeLevel: 'Lớp 12',
    schoolName: 'THPT Chuyên Lam Sơn (Thanh Hóa)',
    createdAt: '2025-03-02T16:10:00.000Z',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 't-6',
    fullName: 'Cô Hoàng Thu Hà',
    email: 'thuha.dialy@gmail.com',
    subject: 'Địa lí',
    gradeLevel: 'Lớp 12',
    schoolName: 'THPT Chuyên Phan Bội Châu (Nghệ An)',
    createdAt: '2025-03-05T10:20:00.000Z',
    avatarColor: 'bg-teal-600',
  },
];

let feedbacksDb: Array<{
  id: string;
  teacherName: string;
  schoolName: string;
  subject: string;
  rating: number;
  comment: string;
  createdAt: string;
}> = [
  {
    id: 'fb-1',
    teacherName: 'Cô Hoàng Thu Hà',
    schoolName: 'THPT Chuyên Phan Bội Châu',
    subject: 'Địa lí',
    rating: 5,
    comment: 'Tính năng AI đọc tài liệu file PDF và Word phân tích Yêu cầu cần đạt môn Địa lí lớp 10, 11, 12 cực kỳ chuẩn! Tự động bóc tách các câu hỏi Atlat, bảng số liệu và dạng Đúng/Sai 4 ý rất chính xác.',
    createdAt: '2025-03-06T08:15:00.000Z',
  },
  {
    id: 'fb-2',
    teacherName: 'Thầy Nguyễn Văn An',
    schoolName: 'THPT Chuyên Hà Nội - Amsterdam',
    subject: 'Toán học',
    rating: 5,
    comment: 'Ứng dụng xuất ma trận và đặc tả cực kỳ chuẩn theo chương trình GDPT 2018 mới của Bộ GD&ĐT. Tính năng trộn 4 mã đề 101, 102, 103, 104 xuất file Word bảng biểu rất đẹp, không hề bị lỗi font hay công thức Toán LaTeX!',
    createdAt: '2025-02-20T10:15:00.000Z',
  },
  {
    id: 'fb-3',
    teacherName: 'Cô Trần Thị Mai',
    schoolName: 'THPT Chu Văn An',
    subject: 'Ngữ văn',
    rating: 5,
    comment: 'Rất tiện lợi cho giáo viên khi xây dựng đề kiểm tra định kì và bản đặc tả nộp tổ chuyên môn. Đề xuất đúng ngữ liệu đọc hiểu và thang điểm nghị luận.',
    createdAt: '2025-02-22T14:30:00.000Z',
  },
];

let statsData = {
  totalExamsGenerated: 1580,
  totalMatrixCreated: 2890,
  totalWordDownloads: 2140,
};

// ==========================================
// API ROUTES
// ==========================================

// 1. Get Stats & Teacher list
app.get('/api/stats', (req, res) => {
  const subjectCounts: { [subject: string]: number } = {};
  teachersDb.forEach((t) => {
    subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1;
  });

  res.json({
    totalTeachers: teachersDb.length,
    totalExamsGenerated: statsData.totalExamsGenerated,
    totalMatrixCreated: statsData.totalMatrixCreated,
    totalWordDownloads: statsData.totalWordDownloads,
    activeUsersOnline: Math.floor(Math.random() * 12) + 28,
    subjectCounts,
    teachers: teachersDb.slice(0, 10),
  });
});

// 2. Register or Login Teacher
app.post('/api/teachers/auth', (req, res) => {
  const { fullName, email, subject, gradeLevel, schoolName } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ Họ tên và Email' });
  }

  let teacher = teachersDb.find((t) => t.email.toLowerCase() === email.toLowerCase());

  if (!teacher) {
    const avatarColors = [
      'bg-blue-600',
      'bg-emerald-600',
      'bg-indigo-600',
      'bg-rose-600',
      'bg-purple-600',
      'bg-amber-600',
      'bg-teal-600',
    ];
    teacher = {
      id: `t-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      subject: subject || 'Địa lí',
      gradeLevel: gradeLevel || 'Lớp 12',
      schoolName: schoolName || 'Trường THPT',
      createdAt: new Date().toISOString(),
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    };
    teachersDb.unshift(teacher);
  } else {
    teacher.fullName = fullName || teacher.fullName;
    teacher.subject = subject || teacher.subject;
    teacher.gradeLevel = gradeLevel || teacher.gradeLevel;
    teacher.schoolName = schoolName || teacher.schoolName;
  }

  res.json({ success: true, teacher });
});

// 3. Feedback APIs
app.get('/api/feedback', (req, res) => {
  res.json(feedbacksDb);
});

app.post('/api/feedback', (req, res) => {
  const { teacherName, schoolName, subject, rating, comment } = req.body;
  if (!comment || !rating) {
    return res.status(400).json({ error: 'Vui lòng điền nội dung đánh giá và chọn số sao' });
  }

  const newFeedback = {
    id: `fb-${Date.now()}`,
    teacherName: teacherName || 'Giáo viên',
    schoolName: schoolName || 'Trường THPT',
    subject: subject || 'Chung',
    rating: Number(rating) || 5,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };

  feedbacksDb.unshift(newFeedback);
  res.json({ success: true, feedback: newFeedback });
});

// 4. AI Document Reader & Curriculum Extractor (Đọc file Word / PDF / Text và bóc tách Yêu cầu cần đạt GDPT 2018)
app.post('/api/ai-extract-requirements', async (req, res) => {
  try {
    const {
      fileBase64,
      mimeType,
      rawText = '',
      fileName = '',
      subject = '',
      grade = '',
    } = req.body;

    if (!fileBase64 && !rawText) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy dữ liệu tệp tin hoặc văn bản để phân tích' });
    }

    const systemPrompt = `Bạn là Chuyên gia Thẩm định Chương trình và Đo lường Đánh giá Giáo dục của Bộ Giáo dục và Đào tạo Việt Nam.
Nhiệm vụ của bạn là ĐỌC VÀ PHÂN TÍCH TOÀN DIỆN TÀI LIỆU (File Word/PDF/Văn bản) do giáo viên tải lên.

Tài liệu này có thể là:
- Chương trình môn học GDPT 2018 (ví dụ: Địa lí, Lịch sử & Địa lí, Toán, Văn, KHTN, Vật lí, Hóa học, Sinh học, v.v.).
- Kế hoạch dạy học / Phân phối chương trình / Đề cương ôn tập / Khung bài học của trường THPT/THCS.
- Bảng đặc tả hoặc danh sách Yêu cầu cần đạt của các chủ đề.

HÃY THỰC HIỆN CÁC BƯỚC:
1. Nhận diện chính xác Môn học (ví dụ: Địa lí, Lịch sử, Toán học...) và Khối lớp (Lớp 10, Lớp 11, Lớp 12, Lớp 6, 7, 8, 9...) nếu có trong tài liệu (hoặc đối chiếu với môn "${subject || 'Địa lí'}" và khối "${grade || 'Lớp 12'}").
2. Bóc tách từng CHỦ ĐỀ / CHƯƠNG và các BÀI HỌC / ĐƠN VỊ KIẾN THỨC tương ứng.
3. Với mỗi chủ đề/bài học, trích xuất và chuẩn hóa YÊU CẦU CẦN ĐẠT theo 4 mức độ tư duy chuẩn GDPT 2018:
   - Nhận biết: Các khái niệm, đối tượng địa lí, vị trí, tọa độ, số liệu, hiện tượng cơ bản.
   - Thông hiểu: Giải thích nguyên nhân, phân tích mối quan hệ nhân quả, so sánh, phân tích biểu đồ, bảng số liệu hoặc Atlat.
   - Vận dụng: Tính toán chỉ số (mật độ dân số, cán cân xuất nhập khẩu, tốc độ tăng trưởng...), giải thích thực tế địa phương/quốc gia.
   - Vận dụng cao: Đề xuất giải pháp bảo vệ môi trường, định hướng phát triển bền vững, tổng hợp kiến thức liên môn.
4. Tạo văn bản chuẩn hóa (formattedRequirements) để nạp thẳng vào Ma trận đề thi.

TRẢ VỀ JSON HỢP LỆ THEO CẤU TRÚC:
{
  "detectedSubject": "Địa lí",
  "detectedGrade": "Lớp 12",
  "summary": "Tóm tắt ngắn gọn phạm vi tài liệu (VD: Tài liệu gồm 3 chủ đề trọng tâm Địa lí tự nhiên Việt Nam, 8 đơn vị bài học)",
  "topics": [
    {
      "id": "top-1",
      "topicName": "Tên chủ đề / Chương",
      "units": ["Bài 1: Tên bài 1", "Bài 2: Tên bài 2"],
      "learningOutcomes": {
        "nhanBiet": "Mô tả yêu cầu mức nhận biết...",
        "thongHieu": "Mô tả yêu cầu mức thông hiểu...",
        "vanDung": "Mô tả yêu cầu mức vận dụng...",
        "vanDungCao": "Mô tả yêu cầu mức vận dụng cao..."
      }
    }
  ],
  "formattedRequirements": "CHỦ ĐỀ 1: ...\\n- Bài 1:...\\n  + Nhận biết:...\\n  + Thông hiểu:...\\n  + Vận dụng:...\\n  + Vận dụng cao:..."
}`;

    let contents: any[] = [];

    if (fileBase64 && mimeType === 'application/pdf') {
      contents = [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: fileBase64,
          },
        },
        {
          text: `${systemPrompt}\n\nTên tệp: ${fileName}\nMôn học dự kiến: ${subject || 'Địa lí'}\nKhối lớp dự kiến: ${grade || 'Lớp 12'}`,
        },
      ];
    } else {
      contents = [
        {
          text: `${systemPrompt}\n\nTÊN TỆP: ${fileName}\nMÔN HỌC: ${subject || 'Địa lí'}\nKHỐI LỚP: ${grade || 'Lớp 12'}\n\nNỘI DUNG TÀI LIỆU TRÍCH XUẤT:\n"""\n${(rawText || '').slice(0, 40000)}\n"""`,
        },
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error extracting requirements with AI:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi phân tích tài liệu Yêu cầu cần đạt bằng AI',
    });
  }
});

// 5. AI Generator: Ma trận & Bản đặc tả theo chuẩn Bộ GD&ĐT
const handleMatrixGenerate = async (req: express.Request, res: express.Response) => {
  try {
    const rawInfo = req.body.info || req.body;
    const {
      subject = 'Địa lí',
      grade = 'Lớp 12',
      examType = 'Kiểm tra giữa học kì 1',
      durationMinutes = 45,
      structureOption = 'option1',
      customConfig,
      requirementsText = '',
    } = rawInfo;

    statsData.totalMatrixCreated += 1;

    const structureDescriptions = {
      option1: 'Đầy đủ 4 dạng theo cấu trúc mới nhất Bộ GD&ĐT 2025: Phần I (TNKQ 4 lựa chọn), Phần II (TN Đúng/Sai 4 ý), Phần III (Trả lời ngắn), Phần IV (Tự luận)',
      option2: '3 dạng câu hỏi: Phần I (TNKQ 4 lựa chọn), Phần II (TN Đúng/Sai 4 ý), Phần IV (Tự luận)',
      option3: '2 dạng câu hỏi (Không có Tự luận): Phần I (TNKQ 4 lựa chọn), Phần III (Trả lời ngắn)',
      option4: `Tùy chỉnh số lượng câu: Phần I (${customConfig?.part1Count || 12} câu, ${customConfig?.part1Points || 3.0}đ), Phần II (${customConfig?.part2Count || 4} câu, ${customConfig?.part2Points || 4.0}đ), Phần III (${customConfig?.part3Count || 4} câu, ${customConfig?.part3Points || 2.0}đ), Phần IV (${customConfig?.part4Count || 1} câu, ${customConfig?.part4Points || 1.0}đ)`,
    };

    const prompt = `Bạn là Chuyên gia Khảo thí và Đo lường Đánh giá Giáo dục của Bộ Giáo dục và Đào tạo Việt Nam.
Hãy xây dựng MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ và BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA chuẩn xác 100% theo Chương trình Giáo dục phổ thông 2018 và định dạng đề thi mới nhất 2025 của Bộ GD&ĐT.

THÔNG TIN ĐỀ THI:
- Môn học: ${subject}
- Khối lớp: ${grade}
- Đợt kiểm tra: ${examType}
- Thời gian làm bài: ${durationMinutes} phút
- Cấu trúc đề: ${structureDescriptions[structureOption as keyof typeof structureDescriptions] || structureDescriptions.option1}
- CĂN CỨ YÊU CẦU CẦN ĐẠT CỦA MÔN HỌC ĐỐI CHIẾU CHÍNH XÁC:
"""
${requirementsText ? requirementsText.slice(0, 25000) : 'Áp dụng đầy đủ chuẩn kiến thức và Yêu cầu cần đạt Chương trình GDPT 2018 cho môn ' + subject + ' ' + grade}
"""

QUY ĐỊNH CHUYÊN MÔN:
1. Đối với môn Địa lí / Lịch sử & Địa lí:
   - Các chủ đề phải bám sát chương trình GDPT 2018 (Ví dụ Địa lí 12: Vị trí địa lí và phạm vi lãnh thổ, Đặc điểm chung của tự nhiên, Vấn đề sử dụng và bảo vệ tự nhiên, Địa lí dân cư, Địa lí các ngành kinh tế, Các vùng kinh tế).
   - Bản đặc tả phải ghi rõ yêu cầu cần đạt kiểm tra kĩ năng khai thác Atlat Địa lí Việt Nam, kĩ năng nhận xét và tính toán bảng số liệu, đọc biểu đồ địa lí.
2. Đối với các môn Tự nhiên & Xã hội khác: Phân bổ đều các cấp độ Nhận biết (~30-40%), Thông hiểu (~30-40%), Vận dụng (~20%), Vận dụng cao (~10%).
3. Mọi công thức Toán/Lý/Hóa/Số học trong bản đặc tả phải đặt trong dấu $...$ (nếu có).

YÊU CẦU ĐẦU RA JSON HỢP LỆ CHÍNH XÁC:
{
  "matrix": {
    "topics": [
      {
        "id": "t1",
        "topicName": "Tên chủ đề 1",
        "contentUnits": ["Bài/Đơn vị kiến thức 1", "Bài/Đơn vị kiến thức 2"],
        "part1": { "nhanBiet": 2, "thongHieu": 2, "vanDung": 0, "vanDungCao": 0 },
        "part2": { "nhanBiet": 1, "thongHieu": 1, "vanDung": 0, "vanDungCao": 0 },
        "part3": { "nhanBiet": 0, "thongHieu": 1, "vanDung": 1, "vanDungCao": 0 },
        "part4": { "nhanBiet": 0, "thongHieu": 0, "vanDung": 1, "vanDungCao": 0 },
        "totalQuestions": 6,
        "totalPoints": 4.5,
        "ratioPercent": 45
      }
    ],
    "summary": {
      "nhanBietPoints": 3.0,
      "thongHieuPoints": 4.0,
      "vanDungPoints": 2.0,
      "vanDungCaoPoints": 1.0,
      "totalPoints": 10.0,
      "nhanBietPercent": 30,
      "thongHieuPercent": 40,
      "vanDungPercent": 20,
      "vanDungCaoPercent": 10,
      "part1TotalPoints": 3.0,
      "part2TotalPoints": 4.0,
      "part3TotalPoints": 2.0,
      "part4TotalPoints": 1.0
    }
  },
  "specification": [
    {
      "id": "spec-1",
      "order": 1,
      "topic": "Tên chủ đề",
      "unit": "Tên bài / mạch kiến thức",
      "learningOutcomes": "Mô tả chi tiết năng lực / yêu cầu cần đạt kiểm tra theo chuẩn GDPT 2018",
      "partType": "part1",
      "partTypeName": "Phần I: TNKQ 4 lựa chọn",
      "cognitiveLevel": "Nhận biết",
      "questionNumberStr": "Câu 1, 2",
      "pointValue": 0.5
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const resultText = response.text || '{}';
    const parsedData = JSON.parse(resultText);

    res.json({
      success: true,
      matrix: parsedData.matrix,
      specification: parsedData.specification || [],
    });
  } catch (error: any) {
    console.error('Error in matrix generation:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi tạo ma trận và bản đặc tả bằng AI' });
  }
};

app.post('/api/matrix/generate', handleMatrixGenerate);
app.post('/api/generate-matrix-spec', handleMatrixGenerate);

// 6. AI Generator: Sinh đề kiểm tra mẫu và đầy đủ các phần câu hỏi có LaTeX
const handleExamGenerate = async (req: express.Request, res: express.Response) => {
  try {
    const rawInfo = req.body.info || req.body;
    const {
      subject = 'Địa lí',
      grade = 'Lớp 12',
      examType = 'Kiểm tra giữa học kì 1',
      durationMinutes = 45,
      structureOption = 'option1',
    } = rawInfo;

    const matrix = req.body.matrix;
    const specification = req.body.specification;

    statsData.totalExamsGenerated += 1;

    const prompt = `Bạn là Chuyên gia Biên soạn Đề kiểm tra và Đề thi Tốt nghiệp THPT của Bộ GD&ĐT Việt Nam.
Hãy biên soạn ĐỀ KIỂM TRA ĐỊNH KÌ ĐẦY ĐỦ CÂU HỎI VÀ ĐÁP ÁN CHUẨN XÁC, đối chiếu 100% với Ma trận và Bản đặc tả đã duyệt.

THÔNG TIN:
- Môn học: ${subject}
- Khối: ${grade} (${examType}, ${durationMinutes} phút)
- Yêu cầu cấu trúc: ${structureOption}
- MA TRẬN & BẢN ĐẶC TẢ ĐÃ DUYỆT:
${JSON.stringify({ matrix, specification }, null, 2)}

QUY TẮC ĐẶC BIỆT THEO MÔN HỌC:
1. Đối với môn Địa lí:
   - Các câu hỏi Phần I & Phần II phải phong phú, bao gồm câu hỏi lý thuyết, câu hỏi khai thác Atlat Địa lí Việt Nam (chỉ dẫn rõ trang Atlat hoặc đối tượng), câu hỏi nhận xét bảng số liệu/biểu đồ, câu hỏi tình huống thực tiễn.
   - Phần II (TN Đúng/Sai): Đoạn dẫn về khí hậu, tự nhiên, dân cư hoặc kinh tế với đúng 4 ý a), b), c), d).
   - Phần III (Trả lời ngắn): Các bài toán tính toán địa lí (mật độ dân số, cán cân thương mại, tỉ suất gia tăng tự nhiên, năng suất lúa, tỉ trọng %, cự ly thực tế) với đáp số rõ ràng.
   - Phần IV (Tự luận): Câu hỏi phân tích, giải thích hoặc vẽ/nhận xét bảng số liệu kèm barem điểm từng ý chi tiết.
2. Đối với các môn Tự nhiên (Toán, Vật lí, Hóa học, Sinh học, Tin học, KHTN):
   - Mọi công thức Toán/Lý/Hóa, ký hiệu vectơ, phân số, tích phân, căn bậc hai, phương trình phản ứng hóa học PHẢI dùng chuẩn LaTeX kẹp giữa $...$ (inline) hoặc $$...$$ (block).
3. Đối với môn Ngữ văn/Khoa học xã hội: Đưa ra ngữ liệu đoạn trích/văn bản đầy đủ, câu hỏi đọc hiểu và đề viết rõ ràng.

TRẢ VỀ JSON HỢP LỆ VỚI CẤU TRÚC:
{
  "questions": {
    "part1": [
      {
        "id": "p1-q1",
        "number": 1,
        "prompt": "Nội dung câu hỏi...",
        "options": {
          "A": "Phương án A",
          "B": "Phương án B",
          "C": "Phương án C",
          "D": "Phương án D"
        },
        "answer": "A",
        "explanation": "Lời giải thích chi tiết...",
        "topic": "Tên chủ đề",
        "level": "Nhận biết"
      }
    ],
    "part2": [
      {
        "id": "p2-q1",
        "number": 1,
        "prompt": "Cho đoạn tư liệu/bảng số liệu...",
        "statements": [
          { "id": "a", "text": "Ý a", "isCorrect": true, "explanation": "Giải thích a" },
          { "id": "b", "text": "Ý b", "isCorrect": false, "explanation": "Giải thích b" },
          { "id": "c", "text": "Ý c", "isCorrect": true, "explanation": "Giải thích c" },
          { "id": "d", "text": "Ý d", "isCorrect": false, "explanation": "Giải thích d" }
        ],
        "topic": "Tên chủ đề",
        "level": "Thông hiểu"
      }
    ],
    "part3": [
      {
        "id": "p3-q1",
        "number": 1,
        "prompt": "Nội dung câu hỏi tính toán/trả lời số liệu ngắn...",
        "answer": "290",
        "explanation": "Chi tiết các bước tính ra đáp số...",
        "topic": "Tên chủ đề",
        "level": "Vận dụng"
      }
    ],
    "part4": [
      {
        "id": "p4-q1",
        "number": 1,
        "prompt": "Đề bài câu hỏi tự luận...",
        "maxPoints": 1.0,
        "gradingGuide": [
          { "step": "Ý 1: Nêu luận điểm / giải thích", "points": 0.5 },
          { "step": "Ý 2: Phân tích số liệu / kết luận", "points": 0.5 }
        ],
        "topic": "Tên chủ đề",
        "level": "Vận dụng cao"
      }
    ]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.25,
      },
    });

    const resultText = response.text || '{}';
    const parsedData = JSON.parse(resultText);

    res.json({
      success: true,
      examPackage: {
        info: rawInfo,
        matrix: matrix || {},
        specification: specification || [],
        questions: parsedData.questions || {
          part1: [],
          part2: [],
          part3: [],
          part4: [],
        },
      },
    });
  } catch (error: any) {
    console.error('Error in exam generation:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi sinh đề thi bằng AI' });
  }
};

app.post('/api/exam/generate', handleExamGenerate);
app.post('/api/generate-exam', handleExamGenerate);

// 7. Increment download counter
app.post('/api/stats/download', (req, res) => {
  statsData.totalWordDownloads += 1;
  res.json({ success: true, count: statsData.totalWordDownloads });
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduMatrix AI Server is running on port ${PORT}`);
  });
}

startServer();
