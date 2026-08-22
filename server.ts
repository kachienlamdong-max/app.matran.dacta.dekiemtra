import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser with large limit for documents
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
    teacherName: 'Thầy Nguyễn Văn An',
    schoolName: 'THPT Chuyên Hà Nội - Amsterdam',
    subject: 'Toán học',
    rating: 5,
    comment: 'Ứng dụng xuất ma trận và đặc tả cực kỳ chuẩn theo chương trình GDPT 2018 mới của Bộ GD&ĐT. Tính năng trộn 4 mã đề 101, 102, 103, 104 xuất file Word bảng biểu rất đẹp, không hề bị lỗi font hay công thức Toán LaTeX!',
    createdAt: '2025-02-20T10:15:00.000Z',
  },
  {
    id: 'fb-2',
    teacherName: 'Cô Trần Thị Mai',
    schoolName: 'THPT Chu Văn An',
    subject: 'Ngữ văn',
    rating: 5,
    comment: 'Rất tiện lợi cho giáo viên khi xây dựng đề kiểm tra định kì và bản đặc tả nộp tổ chuyên môn. Đề xuất đúng ngữ liệu đọc hiểu và thang điểm nghị luận.',
    createdAt: '2025-02-22T14:30:00.000Z',
  },
  {
    id: 'fb-3',
    teacherName: 'Thầy Lê Hoàng Nam',
    schoolName: 'THPT Chuyên Lê Hồng Phong',
    subject: 'Vật lí',
    rating: 5,
    comment: 'Phần trắc nghiệm Đúng/Sai 4 lệnh hỏi và Trả lời ngắn số học định dạng 2025 được sinh rất chuẩn xác, câu hỏi vận dụng thực tế hay.',
    createdAt: '2025-02-24T09:40:00.000Z',
  },
];

let statsData = {
  totalExamsGenerated: 1428,
  totalMatrixCreated: 2650,
  totalWordDownloads: 1894,
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
    activeUsersOnline: Math.floor(Math.random() * 12) + 24,
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
      subject: subject || 'Toán học',
      gradeLevel: gradeLevel || 'Lớp 12',
      schoolName: schoolName || 'Trường THPT',
      createdAt: new Date().toISOString(),
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    };
    teachersDb.unshift(teacher);
  } else {
    // Update profile
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

// 4. AI Generator: Ma trận & Bản đặc tả theo chuẩn Bộ GD&ĐT (Supporting both /api/matrix/generate and /api/generate-matrix-spec)
const handleMatrixGenerate = async (req: express.Request, res: express.Response) => {
  try {
    const rawInfo = req.body.info || req.body;
    const {
      subject = 'Toán học',
      grade = 'Lớp 12',
      examType = 'Kiểm tra Giữa Học kì 1',
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
Hãy xây dựng MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ và BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA chuẩn xác 100% theo Chương trình Giáo dục phổ thông 2018 và định dạng đề thi mới của Bộ GD&ĐT.

THÔNG TIN ĐỀ THI:
- Môn học: ${subject}
- Khối lớp: ${grade}
- Đợt kiểm tra: ${examType}
- Thời gian làm bài: ${durationMinutes} phút
- Cấu trúc đề: ${structureDescriptions[structureOption as keyof typeof structureDescriptions] || structureDescriptions.option1}
- YÊU CẦU CẦN ĐẠT CỦA MÔN HỌC/BÀI HỌC (CĂN CỨ ĐỐI CHIẾU CHÍNH XÁC):
"""
${requirementsText || 'Xây dựng dựa trên chuẩn chương trình GDPT 2018 cho môn ' + subject + ' ' + grade}
"""

YÊU CẦU ĐẦU RA JSON CHUẨN:
Hãy trả về một JSON hợp lệ với cấu trúc chính xác sau (Lưu ý: tất cả công thức Toán/Lý/Hóa phải đặt trong dấu $ hoặc $$):
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

// 5. AI Generator: Sinh đề kiểm tra mẫu và đầy đủ các phần câu hỏi có LaTeX (Supporting both /api/exam/generate and /api/generate-exam)
const handleExamGenerate = async (req: express.Request, res: express.Response) => {
  try {
    const rawInfo = req.body.info || req.body;
    const {
      subject = 'Toán học',
      grade = 'Lớp 12',
      examType = 'Kiểm tra Giữa Học kì 1',
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
- MA TRẬN & BẢN ĐẶC TẢ:
${JSON.stringify({ matrix, specification }, null, 2)}

QUY TẮC ĐẶC BIỆT VỀ CÔNG THỨC & NGỮ LIỆU:
1. Đối với các môn Tự nhiên (Toán, Vật lí, Hóa học, Sinh học, Tin học, KHTN):
   - Mọi công thức Toán/Lý/Hóa, ký hiệu vectơ, phân số, tích phân, căn bậc hai, phương trình phản ứng hóa học PHẢI dùng chuẩn LaTeX kẹp giữa $...$ (inline) hoặc $$...$$ (block).
   - Ví dụ Toán: $y = \\frac{2x - 1}{x + 1}$, $\\vec{u} = (1; -2; 3)$, $\\int_0^1 x e^x dx$.
   - Ví dụ Vật lí: $Q = mc\\Delta T$, $pV = nRT$, $F = k\\frac{|q_1 q_2|}{r^2}$.
   - Ví dụ Hóa học: $\\text{CH}_3\\text{COOCH}_3 + \\text{NaOH} \\xrightarrow{t^\\circ} \\text{CH}_3\\text{COONa} + \\text{CH}_3\\text{OH}$.
2. Đối với môn Ngữ văn/Khoa học xã hội: Đưa ra ngữ liệu đoạn trích/văn bản đầy đủ, câu hỏi đọc hiểu và đề viết rõ ràng.
3. Phần I (TNKQ 4 lựa chọn): Mỗi câu có 4 phương án A, B, C, D rõ ràng, kèm đáp án đúng ('A'|'B'|'C'|'D') và lời giải thích chi tiết.
4. Phần II (TN Đúng/Sai): Mỗi câu gồm đoạn dẫn và đúng 4 lệnh hỏi a), b), c), d), kèm giá trị isCorrect (true/false) và lời giải thích.
5. Phần III (Trả lời ngắn): Mỗi câu là câu hỏi bài toán/tình huống yêu cầu kết quả cụ thể (số thực, số nguyên, phân số, v.v.), kèm đáp số và lời giải.
6. Phần IV (Tự luận): Câu hỏi tự luận với thang điểm (maxPoints) và các bước chấm (gradingGuide) chi tiết.

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
        "explanation": "Lời giải thích...",
        "topic": "Tên chủ đề",
        "level": "Nhận biết"
      }
    ],
    "part2": [
      {
        "id": "p2-q1",
        "number": 1,
        "prompt": "Cho hàm số/hệ chất...",
        "statements": [
          { "id": "a", "text": "Khẳng định a", "isCorrect": true, "explanation": "Giải thích a" },
          { "id": "b", "text": "Khẳng định b", "isCorrect": false, "explanation": "Giải thích b" },
          { "id": "c", "text": "Khẳng định c", "isCorrect": true, "explanation": "Giải thích c" },
          { "id": "d", "text": "Khẳng định d", "isCorrect": false, "explanation": "Giải thích d" }
        ],
        "topic": "Tên chủ đề",
        "level": "Thông hiểu"
      }
    ],
    "part3": [
      {
        "id": "p3-q1",
        "number": 1,
        "prompt": "Nội dung câu hỏi tính toán...",
        "answer": "12.5",
        "explanation": "Chi tiết các bước giải ra đáp số 12.5",
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
          { "step": "Bước 1: Viết phương trình / nêu luận điểm", "points": 0.5 },
          { "step": "Bước 2: Tính toán kết quả / kết luận", "points": 0.5 }
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

// 6. Parse Document Text (support TXT / Base64 docx extract)
app.post('/api/parse-document', async (req, res) => {
  try {
    const { content, fileName } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Không có dữ liệu tệp tin' });
    }

    res.json({
      success: true,
      extractedText: content,
      fileName,
      charCount: content.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi khi xử lý tệp tin' });
  }
});

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
