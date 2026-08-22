import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  HeadingLevel,
} from 'docx';
import { ExamPackage, ShuffledExamCode } from '../types';

// Standard clean borders
const standardTableBorders = {
  top: { style: BorderStyle.SINGLE, size: 6, color: '2B3A42' },
  bottom: { style: BorderStyle.SINGLE, size: 6, color: '2B3A42' },
  left: { style: BorderStyle.SINGLE, size: 6, color: '2B3A42' },
  right: { style: BorderStyle.SINGLE, size: 6, color: '2B3A42' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
};

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

// Clean plain text representation of LaTeX formulas for docx
export function cleanLatexForDocx(text: string): string {
  if (!text) return '';
  return text
    .replace(/\$\$(.*?)\$\$/g, '$1')
    .replace(/\$(.*?)\$/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\vec\{([^}]+)\}/g, 'vectơ $1')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\pi/g, 'π')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\degree/g, '°')
    .replace(/\\infty/g, '∞')
    .replace(/\\to/g, '→')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1');
}

export async function generateComprehensiveDocx(
  examPkg: ExamPackage,
  shuffledCodes: ShuffledExamCode[],
  includeAll4Codes: boolean = true
): Promise<Blob> {
  const { info, matrix, specification } = examPkg;

  const docChildren: (Paragraph | Table)[] = [];

  // ==========================================
  // SECTION 1: HEADER & GENERAL INFO
  // ==========================================
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: (info.departmentName || 'SỞ GD&ĐT').toUpperCase(), bold: true, size: 22, font: 'Times New Roman' }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: (info.schoolName || 'TRƯỜNG THPT / THCS').toUpperCase(), bold: true, size: 22, font: 'Times New Roman' }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: '-------------------------', size: 18, font: 'Times New Roman' }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: (info.examTitle || `KIỂM TRA ${info.examType.toUpperCase()}`).toUpperCase(), bold: true, size: 24, font: 'Times New Roman', color: '1E3A8A' }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `MÔN: ${info.subject.toUpperCase()} - ${info.grade.toUpperCase()}`, bold: true, size: 22, font: 'Times New Roman' }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `Năm học: ${info.academicYear || '2024 - 2025'} | Thời gian: ${info.durationMinutes} phút`, italics: true, size: 20, font: 'Times New Roman' }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  docChildren.push(headerTable);
  docChildren.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // ==========================================
  // SECTION 2: MA TRẬN ĐỀ KIỂM TRA
  // ==========================================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({ text: 'PHẦN 1: MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ', bold: true, size: 26, font: 'Times New Roman', color: '1E3A8A' }),
      ],
      spacing: { before: 200, after: 150 },
    })
  );

  // Matrix Table Header Rows (Standard MOET layout)
  const matrixHeaderRow1 = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        rowSpan: 2,
        width: { size: 6, type: WidthType.PERCENTAGE },
        shading: { fill: 'F1F5F9' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TT', bold: true, size: 18, font: 'Times New Roman' })] })],
      }),
      new TableCell({
        rowSpan: 2,
        width: { size: 24, type: WidthType.PERCENTAGE },
        shading: { fill: 'F1F5F9' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Chủ đề / Nội dung kiến thức', bold: true, size: 18, font: 'Times New Roman' })] })],
      }),
      new TableCell({
        columnSpan: 4,
        width: { size: 24, type: WidthType.PERCENTAGE },
        shading: { fill: 'E2E8F0' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Phần I: TNKQ 4 lựa chọn (Số câu)', bold: true, size: 17, font: 'Times New Roman' })] })],
      }),
      new TableCell({
        columnSpan: 4,
        width: { size: 20, type: WidthType.PERCENTAGE },
        shading: { fill: 'E2E8F0' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Phần II: Đúng/Sai (Số lệnh)', bold: true, size: 17, font: 'Times New Roman' })] })],
      }),
      new TableCell({
        columnSpan: 3,
        width: { size: 14, type: WidthType.PERCENTAGE },
        shading: { fill: 'E2E8F0' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Phần III/IV: TLN / TL', bold: true, size: 17, font: 'Times New Roman' })] })],
      }),
      new TableCell({
        rowSpan: 2,
        width: { size: 6, type: WidthType.PERCENTAGE },
        shading: { fill: 'F1F5F9' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tổng điểm', bold: true, size: 18, font: 'Times New Roman' })] })],
      }),
      new TableCell({
        rowSpan: 2,
        width: { size: 6, type: WidthType.PERCENTAGE },
        shading: { fill: 'F1F5F9' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tỉ lệ %', bold: true, size: 18, font: 'Times New Roman' })] })],
      }),
    ],
  });

  const matrixHeaderRow2 = new TableRow({
    tableHeader: true,
    children: [
      // Part 1 subcolumns
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NB', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TH', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VD', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VDC', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      // Part 2 subcolumns
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NB', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TH', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VD', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VDC', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      // Part 3/4 subcolumns
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TH', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VD', bold: true, size: 16, font: 'Times New Roman' })] })] }),
      new TableCell({ shading: { fill: 'F8FAFC' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VDC', bold: true, size: 16, font: 'Times New Roman' })] })] }),
    ],
  });

  const matrixRows: TableRow[] = [matrixHeaderRow1, matrixHeaderRow2];

  matrix.topics.forEach((t, idx) => {
    matrixRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${idx + 1}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t.topicName, bold: true, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.part1?.nhanBiet || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.part1?.thongHieu || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.part1?.vanDung || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.part1?.vanDungCao || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.part2?.nhanBiet || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.part2?.thongHieu || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.part2?.vanDung || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.part2?.vanDungCao || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${(t.part3?.thongHieu || 0) + (t.part4?.thongHieu || 0) || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${(t.part3?.vanDung || 0) + (t.part4?.vanDung || 0) || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${(t.part3?.vanDungCao || 0) + (t.part4?.vanDungCao || 0) || '-'}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.totalPoints || 0}đ`, bold: true, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${t.ratioPercent || 0}%`, size: 18, font: 'Times New Roman' })] })] }),
        ],
      })
    );
  });

  // Summary Row
  matrixRows.push(
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          shading: { fill: 'F1F5F9' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TỔNG ĐIỂM THEO MỨC ĐỘ', bold: true, size: 18, font: 'Times New Roman' })] })],
        }),
        new TableCell({ columnSpan: 4, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.summary?.part1TotalPoints || 3.0} điểm`, bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ columnSpan: 4, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.summary?.part2TotalPoints || 4.0} điểm`, bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ columnSpan: 3, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${(matrix.summary?.part3TotalPoints || 0) + (matrix.summary?.part4TotalPoints || 0)} điểm`, bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ shading: { fill: 'E2E8F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.summary?.totalPoints || 10}đ`, bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ shading: { fill: 'E2E8F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '100%', bold: true, size: 18, font: 'Times New Roman' })] })] }),
      ],
    })
  );

  const matrixDocxTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: standardTableBorders,
    rows: matrixRows,
  });

  docChildren.push(matrixDocxTable);
  docChildren.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // ==========================================
  // SECTION 3: BẢN ĐẶC TẢ MA TRẬN ĐỀ
  // ==========================================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({ text: 'PHẦN 2: BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA', bold: true, size: 26, font: 'Times New Roman', color: '1E3A8A' }),
      ],
      spacing: { before: 250, after: 150 },
    })
  );

  const specRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TT', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Chủ đề / Đơn vị KT', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ width: { size: 44, type: WidthType.PERCENTAGE }, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mức độ đánh giá / Yêu cầu cần đạt', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Dạng câu hỏi', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Số câu (Câu số)', bold: true, size: 18, font: 'Times New Roman' })] })] }),
      ],
    }),
  ];

  specification.forEach((spec, sIdx) => {
    specRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${sIdx + 1}`, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: spec.topic, bold: true, size: 18, font: 'Times New Roman' })] }), new Paragraph({ children: [new TextRun({ text: spec.unit || '', italics: true, size: 16, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `* Mức độ ${spec.cognitiveLevel}: `, bold: true, size: 18, font: 'Times New Roman' }), new TextRun({ text: spec.learningOutcomes, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: spec.partTypeName || spec.partType, size: 18, font: 'Times New Roman' })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: spec.questionNumberStr, bold: true, size: 18, font: 'Times New Roman' })] })] }),
        ],
      })
    );
  });

  const specDocxTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: standardTableBorders,
    rows: specRows,
  });

  docChildren.push(specDocxTable);
  docChildren.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // ==========================================
  // SECTION 4: ĐỀ KIỂM TRA CHI TIẾT (MÃ 101 HOẶC TẤT CẢ 4 MÃ ĐỀ)
  // ==========================================
  const codesToExport = includeAll4Codes ? shuffledCodes : [shuffledCodes[0]];

  codesToExport.forEach((examCode) => {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({ text: `ĐỀ KIỂM TRA ĐỊNH KÌ - MÃ ĐỀ ${examCode.code}`, bold: true, size: 28, font: 'Times New Roman', color: '1E3A8A' }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `(Môn: ${info.subject} - ${info.grade} | Thời gian: ${info.durationMinutes} phút - Không kể thời gian phát đề)`, italics: true, size: 20, font: 'Times New Roman' }),
        ],
        spacing: { after: 150 },
      })
    );

    // Student info line
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Họ và tên thí sinh: ............................................................................  Số báo danh: ..........................', italics: true, size: 20, font: 'Times New Roman' }),
        ],
        spacing: { after: 200 },
      })
    );

    // --- PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN ---
    if (examCode.questions.part1.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.', bold: true, size: 22, font: 'Times New Roman', color: '0F172A' }),
            new TextRun({ text: ` Thí sinh trả lời từ câu 1 đến câu ${examCode.questions.part1.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`, italics: true, size: 20, font: 'Times New Roman' }),
          ],
          spacing: { before: 150, after: 120 },
        })
      );

      examCode.questions.part1.forEach((q) => {
        const cleanPrompt = cleanLatexForDocx(q.prompt);
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${q.number}: `, bold: true, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: cleanPrompt, size: 20, font: 'Times New Roman' }),
            ],
            spacing: { before: 80, after: 40 },
          })
        );

        // Options A, B, C, D
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `A. ${cleanLatexForDocx(q.options.A)}`, size: 20, font: 'Times New Roman' }),
            ],
            indent: { left: 360 },
            spacing: { after: 30 },
          })
        );
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `B. ${cleanLatexForDocx(q.options.B)}`, size: 20, font: 'Times New Roman' }),
            ],
            indent: { left: 360 },
            spacing: { after: 30 },
          })
        );
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `C. ${cleanLatexForDocx(q.options.C)}`, size: 20, font: 'Times New Roman' }),
            ],
            indent: { left: 360 },
            spacing: { after: 30 },
          })
        );
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `D. ${cleanLatexForDocx(q.options.D)}`, size: 20, font: 'Times New Roman' }),
            ],
            indent: { left: 360 },
            spacing: { after: 80 },
          })
        );
      });
    }

    // --- PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI ---
    if (examCode.questions.part2.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'PHẦN II. Câu trắc nghiệm đúng sai.', bold: true, size: 22, font: 'Times New Roman', color: '0F172A' }),
            new TextRun({ text: ` Thí sinh trả lời từ câu 1 đến câu ${examCode.questions.part2.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.`, italics: true, size: 20, font: 'Times New Roman' }),
          ],
          spacing: { before: 180, after: 120 },
        })
      );

      examCode.questions.part2.forEach((q) => {
        const cleanPrompt = cleanLatexForDocx(q.prompt);
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${q.number}: `, bold: true, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: cleanPrompt, size: 20, font: 'Times New Roman' }),
            ],
            spacing: { before: 80, after: 40 },
          })
        );

        q.statements.forEach((stmt) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${stmt.id}) `, bold: true, size: 20, font: 'Times New Roman' }),
                new TextRun({ text: cleanLatexForDocx(stmt.text), size: 20, font: 'Times New Roman' }),
              ],
              indent: { left: 360 },
              spacing: { after: 30 },
            })
          );
        });
      });
    }

    // --- PHẦN III: TRẢ LỜI NGẮN ---
    if (examCode.questions.part3.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'PHẦN III. Câu trắc nghiệm trả lời ngắn.', bold: true, size: 22, font: 'Times New Roman', color: '0F172A' }),
            new TextRun({ text: ` Thí sinh trả lời từ câu 1 đến câu ${examCode.questions.part3.length}. Điền kết quả / đáp số ngắn gọn vào phiếu trả lời.`, italics: true, size: 20, font: 'Times New Roman' }),
          ],
          spacing: { before: 180, after: 120 },
        })
      );

      examCode.questions.part3.forEach((q) => {
        const cleanPrompt = cleanLatexForDocx(q.prompt);
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${q.number}: `, bold: true, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: cleanPrompt, size: 20, font: 'Times New Roman' }),
            ],
            spacing: { before: 80, after: 60 },
          })
        );
      });
    }

    // --- PHẦN IV: TỰ LUẬN ---
    if (examCode.questions.part4.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'PHẦN IV. Tự luận.', bold: true, size: 22, font: 'Times New Roman', color: '0F172A' }),
            new TextRun({ text: ' Thí sinh trình bày chi tiết lời giải hoặc bài văn vào giấy làm bài.', italics: true, size: 20, font: 'Times New Roman' }),
          ],
          spacing: { before: 180, after: 120 },
        })
      );

      examCode.questions.part4.forEach((q) => {
        const cleanPrompt = cleanLatexForDocx(q.prompt);
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${q.number} (${q.maxPoints} điểm): `, bold: true, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: cleanPrompt, size: 20, font: 'Times New Roman' }),
            ],
            spacing: { before: 80, after: 60 },
          })
        );
      });
    }

    // End of exam marker
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: '---------- HẾT (MÃ ĐỀ ' + examCode.code + ') ----------', bold: true, size: 20, font: 'Times New Roman' }),
        ],
        spacing: { before: 200, after: 250 },
      })
    );
  });

  // ==========================================
  // SECTION 5: ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM
  // ==========================================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({ text: 'ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHI TIẾT', bold: true, size: 28, font: 'Times New Roman', color: '1E3A8A' }),
      ],
      spacing: { before: 300, after: 150 },
    })
  );

  codesToExport.forEach((examCode) => {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [
          new TextRun({ text: `1. BẢNG ĐÁP ÁN TRẮC NGHIỆM MÃ ĐỀ ${examCode.code}`, bold: true, size: 22, font: 'Times New Roman' }),
        ],
        spacing: { before: 150, after: 100 },
      })
    );

    // Part 1 Answer Grid
    if (examCode.questions.part1.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: '* Phần I (Mỗi câu trả lời đúng được 0,25 điểm):', bold: true, size: 20, font: 'Times New Roman' }),
          ],
          spacing: { after: 60 },
        })
      );

      const p1Rows: TableRow[] = [];
      const chunks = [];
      for (let i = 0; i < examCode.questions.part1.length; i += 10) {
        chunks.push(examCode.questions.part1.slice(i, i + 10));
      }

      chunks.forEach((chunk) => {
        // Question number row
        p1Rows.push(
          new TableRow({
            children: chunk.map((q) =>
              new TableCell({
                shading: { fill: 'F1F5F9' },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `C.${q.number}`, bold: true, size: 17, font: 'Times New Roman' })] })],
              })
            ),
          })
        );
        // Answer row
        p1Rows.push(
          new TableRow({
            children: chunk.map((q) =>
              new TableCell({
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${examCode.answerKey.part1Answers[q.number] || q.answer}`, bold: true, size: 18, font: 'Times New Roman', color: '1E3A8A' })] })],
              })
            ),
          })
        );
      });

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: standardTableBorders,
          rows: p1Rows,
        })
      );
      docChildren.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    }

    // Part 2 Answer Grid
    if (examCode.questions.part2.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: '* Phần II (Điểm tối đa: 1 câu đúng được 0,1đ; 2 câu được 0,25đ; 3 câu được 0,5đ; 4 câu được 1,0đ):', bold: true, size: 20, font: 'Times New Roman' }),
          ],
          spacing: { after: 60 },
        })
      );

      const p2Rows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Câu hỏi', bold: true, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Lệnh a', bold: true, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Lệnh b', bold: true, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Lệnh c', bold: true, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Lệnh d', bold: true, size: 18, font: 'Times New Roman' })] })] }),
          ],
        }),
      ];

      examCode.questions.part2.forEach((q) => {
        const answers = examCode.answerKey.part2Answers[q.number] || {};
        p2Rows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Câu ${q.number}`, bold: true, size: 18, font: 'Times New Roman' })] })] }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: answers.a ? 'Đúng (Đ)' : 'Sai (S)', bold: true, size: 18, font: 'Times New Roman', color: answers.a ? '15803D' : 'DC2626' })] })] }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: answers.b ? 'Đúng (Đ)' : 'Sai (S)', bold: true, size: 18, font: 'Times New Roman', color: answers.b ? '15803D' : 'DC2626' })] })] }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: answers.c ? 'Đúng (Đ)' : 'Sai (S)', bold: true, size: 18, font: 'Times New Roman', color: answers.c ? '15803D' : 'DC2626' })] })] }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: answers.d ? 'Đúng (Đ)' : 'Sai (S)', bold: true, size: 18, font: 'Times New Roman', color: answers.d ? '15803D' : 'DC2626' })] })] }),
            ],
          })
        );
      });

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: standardTableBorders,
          rows: p2Rows,
        })
      );
      docChildren.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    }

    // Part 3 Answer Grid
    if (examCode.questions.part3.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: '* Phần III (Mỗi câu trả lời đúng được 0,25 - 0,5 điểm):', bold: true, size: 20, font: 'Times New Roman' }),
          ],
          spacing: { after: 60 },
        })
      );

      const p3Rows: TableRow[] = [
        new TableRow({
          children: examCode.questions.part3.map((q) =>
            new TableCell({
              shading: { fill: 'F1F5F9' },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Câu ${q.number}`, bold: true, size: 18, font: 'Times New Roman' })] })],
            })
          ),
        }),
        new TableRow({
          children: examCode.questions.part3.map((q) =>
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cleanLatexForDocx(examCode.answerKey.part3Answers[q.number] || q.answer), bold: true, size: 18, font: 'Times New Roman', color: '1E3A8A' })] })],
            })
          ),
        }),
      ];

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: standardTableBorders,
          rows: p3Rows,
        })
      );
      docChildren.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    }

    // Part 4 Rubric
    if (examCode.questions.part4.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: '2. HƯỚNG DẪN CHẤM TỰ LUẬN (PHẦN IV):', bold: true, size: 22, font: 'Times New Roman' }),
          ],
          spacing: { before: 100, after: 60 },
        })
      );

      examCode.questions.part4.forEach((q) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${q.number} (${q.maxPoints} điểm):`, bold: true, size: 20, font: 'Times New Roman' }),
            ],
            spacing: { before: 60, after: 30 },
          })
        );

        q.gradingGuide.forEach((g) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `- ${cleanLatexForDocx(g.step)}: `, size: 20, font: 'Times New Roman' }),
                new TextRun({ text: `(${g.points} điểm)`, bold: true, size: 20, font: 'Times New Roman', color: '1E3A8A' }),
              ],
              indent: { left: 360 },
              spacing: { after: 30 },
            })
          );
        });
      });
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 2 cm
              bottom: 1134, // 2 cm
              left: 1417, // 2.5 cm
              right: 1134, // 2 cm
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// Save Blob to user's computer
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function exportMatrixToDocx(
  matrix: any,
  specification: any[],
  info: any
): Promise<void> {
  const pkg: ExamPackage = {
    info,
    matrix,
    specification,
    questions: {
      part1: [],
      part2: [],
      part3: [],
      part4: [],
    },
  };

  const blob = await generateComprehensiveDocx(pkg, [], false);
  const safeTitle = `${info.subject}_${info.grade}_MaTran_DacTa`.replace(/[^a-zA-Z0-9_]/g, '_');
  downloadBlob(blob, `${safeTitle}.docx`);
}

export async function exportExamToDocx(
  shuffledCodes: ShuffledExamCode[],
  info: any,
  all4Codes: boolean = true
): Promise<void> {
  const pkg: ExamPackage = {
    info,
    matrix: {
      topics: [],
      summary: {
        totalPoints: 10,
        nhanBietPoints: 3,
        nhanBietPercent: 30,
        thongHieuPoints: 4,
        thongHieuPercent: 40,
        vanDungPoints: 2,
        vanDungPercent: 20,
        vanDungCaoPoints: 1,
        vanDungCaoPercent: 10,
        part1TotalPoints: 3,
        part2TotalPoints: 4,
        part3TotalPoints: 2,
        part4TotalPoints: 1,
      },
    },
    specification: [],
    questions: shuffledCodes[0]?.questions || {
      part1: [],
      part2: [],
      part3: [],
      part4: [],
    },
  };

  const blob = await generateComprehensiveDocx(pkg, shuffledCodes, all4Codes);
  const safeTitle = `${info.subject}_${info.grade}_DeThi_4MaDe_DapAn`.replace(/[^a-zA-Z0-9_]/g, '_');
  downloadBlob(blob, `${safeTitle}.docx`);
}
