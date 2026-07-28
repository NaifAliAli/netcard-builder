"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";

type LabelType = "اسم" | "كود" | "هاتف";

interface TextPosition {
  x: number;
  y: number;
  type: LabelType;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  hasShadow: boolean;
}

interface NetworkRow {
  networkName: string;
  code: string;
  ownerPhone: string;
}

const LABEL_PLACEHOLDER: Record<LabelType, string> = {
  اسم: "[اسم الشبكة]",
  كود: "[رقم الكود]",
  هاتف: "[رقم صاحب الشبكة]",
};

const LABEL_COLOR: Record<LabelType, string> = {
  اسم: "rgba(239, 68, 68, 0.85)",
  كود: "rgba(59, 130, 246, 0.85)",
  هاتف: "rgba(16, 185, 129, 0.85)",
};

const READY_TEMPLATES = [
  { id: "09", label: "قالب 9 — جيب", src: "/ready-templates/template-09.png", featured: true },
  { id: "01", label: "قالب 1", src: "/ready-templates/template-01.jpeg", featured: false },
  { id: "02", label: "قالب 2", src: "/ready-templates/template-02.jpeg", featured: false },
  { id: "03", label: "قالب 3", src: "/ready-templates/template-03.jpeg", featured: false },
  { id: "04", label: "قالب 4", src: "/ready-templates/template-04.jpeg", featured: false },
  { id: "05", label: "قالب 5", src: "/ready-templates/template-05.jpeg", featured: false },
  { id: "06", label: "قالب 6", src: "/ready-templates/template-06.jpeg", featured: false },
  { id: "07", label: "قالب 7", src: "/ready-templates/template-07.jpeg", featured: false },
  { id: "08", label: "قالب 8", src: "/ready-templates/template-08.jpeg", featured: false },
  { id: "10", label: "قالب 10", src: "/ready-templates/template-10.jpeg", featured: false },
] as const;

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim() || "عميل";
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export default function NetworkCardBuilder() {
  const [textPositions, setTextPositions] = useState<TextPosition[]>([]);
  const [currentMode, setCurrentMode] = useState<LabelType>("اسم");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [excelRows, setExcelRows] = useState<NetworkRow[]>([]);
  const [excelFileName, setExcelFileName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [zoom, setZoom] = useState(100);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewRowIndex, setPreviewRowIndex] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"templates" | "design">("templates");
  const [previewTemplateId, setPreviewTemplateId] = useState<string>("09");

  const [fontSize, setFontSize] = useState(35);
  const [fontColor, setFontColor] = useState("#ff6600");
  const [fontFamily, setFontFamily] = useState("'PT Bold Heading', 'Cairo', sans-serif");
  const [hasShadow, setHasShadow] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const textPositionsRef = useRef(textPositions);
  const selectedIndexRef = useRef(selectedIndex);
  const previewModeRef = useRef(previewMode);
  const previewRowRef = useRef<NetworkRow | null>(null);
  const historyRef = useRef<TextPosition[][]>([]);
  const futureRef = useRef<TextPosition[][]>([]);
  const dragRef = useRef<
    | { mode: "move"; index: number; offsetX: number; offsetY: number }
    | { mode: "resize"; index: number; startSize: number; startDist: number }
    | null
  >(null);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    imageRef.current = new Image();
  }, []);

  useEffect(() => {
    textPositionsRef.current = textPositions;
  }, [textPositions]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    previewModeRef.current = previewMode;
  }, [previewMode]);

  const fontOptions = [
    { value: "'PT Bold Heading', 'Cairo', sans-serif", label: "PT Bold Heading (عريض رسمي)" },
    { value: "'AL-Mateen', 'Tajawal', sans-serif", label: "AL-Mateen (متين بارز)" },
    { value: "'AL-Hosam', 'El Messiri', sans-serif", label: "AL-Hosam (الحسام الثقيل)" },
    { value: "'El Messiri', sans-serif", label: "المسيري العريض البارز" },
    { value: "'Tajawal', sans-serif", label: "تجوال ثقيل عريض جداً" },
    { value: "'Lalezar', cursive", label: "لاله زار كروت الشبكة" },
    { value: "'Cairo', sans-serif", label: "كايرو عريض ثقيل" },
    { value: "'Changa', sans-serif", label: "شانجا البارز" },
    { value: "'Reem Kufi', sans-serif", label: "ريم كوفي العريض" },
    { value: "'Marhey', cursive", label: "مارهي إعلاني بارز" },
    { value: "'Almarai', sans-serif", label: "المراعي (بديل زين)" },
    { value: "'Readex Pro', sans-serif", label: "ريديکس برو عريض" },
    { value: "'Almarai', sans-serif", label: "المراعي الثقيل" },
    { value: "'Amiri', serif", label: "أميري عريض" },
    { value: "'Katibeh', cursive", label: "كتيبة فنية" },
    { value: "'Scheherazade New', serif", label: "شهرزاد عريض" },
    { value: "'Harmattan', sans-serif", label: "هيرماثان بارز" },
    { value: "'Aref Ruqaa', serif", label: "عارف رقعة عريض" },
    { value: "'Lemonada', cursive", label: "ليمونادا مميز" },
    { value: "'Rakkas', cursive", label: "ركاس إعلاني فخم" },
  ];

  const getCanvasPoint = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const valueForLabel = (type: LabelType, row: NetworkRow) => {
    if (type === "اسم") return row.networkName;
    if (type === "كود") return row.code;
    return row.ownerPhone;
  };

  const getLabelDisplayText = (pos: TextPosition) => {
    if (previewModeRef.current && previewRowRef.current) {
      return String(valueForLabel(pos.type, previewRowRef.current) || LABEL_PLACEHOLDER[pos.type]);
    }
    return LABEL_PLACEHOLDER[pos.type];
  };

  const measureLabel = (pos: TextPosition) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const text = getLabelDisplayText(pos);
    const pad = Math.max(8, pos.fontSize * 0.2);
    if (!ctx) {
      const w = Math.max(80, pos.fontSize * 3);
      const h = pos.fontSize * 1.3;
      return {
        left: pos.x - w / 2 - pad,
        top: pos.y - h / 2 - pad,
        width: w + pad * 2,
        height: h + pad * 2,
        handleSize: Math.max(12, pos.fontSize * 0.28),
      };
    }
    ctx.font = `bold ${pos.fontSize}px ${pos.fontFamily}`;
    const w = Math.max(ctx.measureText(text).width, 40);
    const h = pos.fontSize * 1.3;
    return {
      left: pos.x - w / 2 - pad,
      top: pos.y - h / 2 - pad,
      width: w + pad * 2,
      height: h + pad * 2,
      handleSize: Math.max(12, pos.fontSize * 0.28),
    };
  };

  const getResizeHandleCenter = (pos: TextPosition) => {
    const b = measureLabel(pos);
    return { x: b.left + b.width, y: b.top + b.height, size: b.handleSize };
  };

  const hitResizeHandle = (x: number, y: number, pos: TextPosition) => {
    const h = getResizeHandleCenter(pos);
    return Math.hypot(x - h.x, y - h.y) <= h.size;
  };

  const findLabelAt = (x: number, y: number, positions: TextPosition[]) => {
    for (let idx = positions.length - 1; idx >= 0; idx--) {
      const b = measureLabel(positions[idx]);
      if (x >= b.left && x <= b.left + b.width && y >= b.top && y <= b.top + b.height) {
        return idx;
      }
      if (Math.hypot(positions[idx].x - x, positions[idx].y - y) < 36) return idx;
    }
    return -1;
  };

  const pushHistory = () => {
    historyRef.current.push(structuredClone(textPositionsRef.current));
    if (historyRef.current.length > 60) historyRef.current.shift();
    futureRef.current = [];
    setCanUndo(true);
  };

  const undo = useCallback(() => {
    if (!historyRef.current.length) return;
    const prev = historyRef.current.pop()!;
    futureRef.current.push(structuredClone(textPositionsRef.current));
    setTextPositions(prev);
    setSelectedIndex(null);
    setCanUndo(historyRef.current.length > 0);
  }, []);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    historyRef.current.push(structuredClone(textPositionsRef.current));
    const next = futureRef.current.pop()!;
    setTextPositions(next);
    setSelectedIndex(null);
    setCanUndo(true);
  }, []);

  const getExportRows = useCallback((): NetworkRow[] => {
    if (excelRows.length > 0) return excelRows;
    const networkName = manualName.trim();
    const code = manualCode.trim();
    const ownerPhone = manualPhone.trim();
    if (networkName || code || ownerPhone) {
      return [{ networkName, code, ownerPhone }];
    }
    return [];
  }, [excelRows, manualName, manualCode, manualPhone]);

  useEffect(() => {
    const rows = getExportRows();
    if (!rows.length) {
      previewRowRef.current = null;
      return;
    }
    const idx = Math.min(previewRowIndex, rows.length - 1);
    previewRowRef.current = rows[idx];
  }, [getExportRows, previewRowIndex, previewMode]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded || !imageRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const positions = textPositionsRef.current;
    const selected = selectedIndexRef.current;
    const isPreview = previewModeRef.current;
    const previewRow = previewRowRef.current;

    positions.forEach((pos, idx) => {
      const textVal =
        isPreview && previewRow
          ? String(valueForLabel(pos.type, previewRow) || LABEL_PLACEHOLDER[pos.type])
          : LABEL_PLACEHOLDER[pos.type];

      ctx.save();
      ctx.font = `bold ${pos.fontSize}px ${pos.fontFamily}`;
      if (pos.hasShadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
      }
      ctx.fillStyle = pos.fontColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(textVal, pos.x, pos.y);
      ctx.restore();

      if (idx === selected) {
        const b = measureLabel(pos);
        ctx.save();
        ctx.setLineDash([8, 5]);
        ctx.strokeStyle = "rgba(79, 70, 229, 0.95)";
        ctx.lineWidth = 2;
        ctx.strokeRect(b.left, b.top, b.width, b.height);
        ctx.setLineDash([]);

        const corners = [
          { x: b.left, y: b.top },
          { x: b.left + b.width, y: b.top },
          { x: b.left, y: b.top + b.height },
          { x: b.left + b.width, y: b.top + b.height },
        ];
        corners.forEach((c, cIdx) => {
          const hs = b.handleSize;
          ctx.fillStyle = cIdx === 3 ? "#4f46e5" : "#ffffff";
          ctx.strokeStyle = "#4f46e5";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(c.x - hs / 2, c.y - hs / 2, hs, hs);
          ctx.fill();
          ctx.stroke();
        });

        ctx.fillStyle = "#4f46e5";
        ctx.font = `bold ${Math.max(12, Math.min(18, pos.fontSize * 0.35))}px Tahoma`;
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${Math.round(pos.fontSize)}px  ↘ اسحب للتكبير/التصغير`, b.left, b.top - 6);
        ctx.restore();
      } else if (!isPreview) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = LABEL_COLOR[pos.type];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }
    });
  }, [imageLoaded]);

  useEffect(() => {
    const isTypingTarget = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        redo();
        return;
      }

      if (isTypingTarget(e.target)) return;

      const index = selectedIndexRef.current;
      const positions = textPositionsRef.current;
      if (index === null || index >= positions.length) return;

      const step = e.shiftKey ? 10 : 2;
      let moved = false;
      const next = [...positions];

      if (e.key === "ArrowUp") {
        next[index] = { ...next[index], y: next[index].y - step };
        moved = true;
      }
      if (e.key === "ArrowDown") {
        next[index] = { ...next[index], y: next[index].y + step };
        moved = true;
      }
      if (e.key === "ArrowLeft") {
        next[index] = { ...next[index], x: next[index].x - step };
        moved = true;
      }
      if (e.key === "ArrowRight") {
        next[index] = { ...next[index], x: next[index].x + step };
        moved = true;
      }
      if (e.key === "[" || e.key === "-") {
        pushHistory();
        const size = Math.max(10, next[index].fontSize - (e.shiftKey ? 4 : 2));
        next[index] = { ...next[index], fontSize: size };
        setFontSize(size);
        setTextPositions(next);
        e.preventDefault();
        return;
      }
      if (e.key === "]" || e.key === "=" || e.key === "+") {
        pushHistory();
        const size = Math.min(200, next[index].fontSize + (e.shiftKey ? 4 : 2));
        next[index] = { ...next[index], fontSize: size };
        setFontSize(size);
        setTextPositions(next);
        e.preventDefault();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        pushHistory();
        setTextPositions(positions.filter((_, idx) => idx !== index));
        setSelectedIndex(null);
        return;
      }

      if (moved) {
        e.preventDefault();
        pushHistory();
        setTextPositions(next);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    if (imageLoaded) redrawCanvas();
  }, [textPositions, imageLoaded, selectedIndex, previewMode, previewRowIndex, manualName, manualCode, manualPhone, excelRows, redrawCanvas]);

  const applyLoadedImage = (src: string, templateId: string | null = null) => {
    const img = imageRef.current;
    if (!img) return;
    img.onload = () => {
      setImageLoaded(true);
      setSelectedTemplateId(templateId);
      historyRef.current = [];
      futureRef.current = [];
      setCanUndo(false);
      setTextPositions([]);
      setSelectedIndex(null);
    };
    img.onerror = () => {
      alert("تعذر تحميل صورة القالب.");
    };
    img.src = src;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      applyLoadedImage(event.target?.result as string, null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectReadyTemplate = (templateId: string, src: string) => {
    applyLoadedImage(src, templateId);
    setPreviewTemplateId(templateId);
    setActiveTab("design");
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });

        if (!rows.length) {
          alert("ملف Excel فارغ.");
          return;
        }

        const first = rows[0].map((c) => cellToString(c).toLowerCase());
        const looksLikeHeader =
          first.some((c) => c.includes("اسم") || c.includes("شبك") || c.includes("كود") || c.includes("هاتف") || c.includes("صاحب") || c.includes("name") || c.includes("code") || c.includes("phone"));

        const dataRows = looksLikeHeader ? rows.slice(1) : rows;
        const parsed: NetworkRow[] = dataRows
          .map((row) => ({
            networkName: cellToString(row[0]),
            code: cellToString(row[1]),
            ownerPhone: cellToString(row[2]),
          }))
          .filter((row) => row.networkName || row.code || row.ownerPhone);

        if (!parsed.length) {
          alert("لم يتم العثور على بيانات صالحة في الملف.\nالأعمدة المتوقعة: اسم الشبكة | رقم الكود | رقم صاحب الشبكة");
          return;
        }

        setExcelRows(parsed);
        setExcelFileName(file.name);
      } catch {
        alert("تعذر قراءة ملف Excel. تأكد أن الصيغة xlsx أو xls.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const selectLabel = (idx: number) => {
    const pos = textPositionsRef.current[idx];
    setSelectedIndex(idx);
    setFontSize(pos.fontSize);
    setFontColor(pos.fontColor);
    setFontFamily(pos.fontFamily);
    setHasShadow(pos.hasShadow);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;
    const point = getCanvasPoint(e);
    if (!point) return;

    const positions = textPositionsRef.current;
    const selected = selectedIndexRef.current;

    if (selected !== null && selected < positions.length && hitResizeHandle(point.x, point.y, positions[selected])) {
      pushHistory();
      selectLabel(selected);
      const dist = Math.max(8, Math.hypot(point.x - positions[selected].x, point.y - positions[selected].y));
      dragRef.current = {
        mode: "resize",
        index: selected,
        startSize: positions[selected].fontSize,
        startDist: dist,
      };
      return;
    }

    const clickedIdx = findLabelAt(point.x, point.y, positions);

    if (clickedIdx !== -1) {
      pushHistory();
      selectLabel(clickedIdx);
      dragRef.current = {
        mode: "move",
        index: clickedIdx,
        offsetX: point.x - positions[clickedIdx].x,
        offsetY: point.y - positions[clickedIdx].y,
      };
    } else {
      pushHistory();
      const newPosition: TextPosition = {
        x: point.x,
        y: point.y,
        type: currentMode,
        fontSize,
        fontColor,
        fontFamily,
        hasShadow,
      };
      const next = [...positions, newPosition];
      setTextPositions(next);
      setSelectedIndex(next.length - 1);
      setFontSize(fontSize);
      dragRef.current = null;
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    const canvas = canvasRef.current;
    if (point && canvas && !dragRef.current) {
      const selected = selectedIndexRef.current;
      const positions = textPositionsRef.current;
      if (selected !== null && selected < positions.length && hitResizeHandle(point.x, point.y, positions[selected])) {
        canvas.style.cursor = "nwse-resize";
      } else if (findLabelAt(point.x, point.y, positions) !== -1) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "crosshair";
      }
    }

    if (!dragRef.current || !point) return;

    const next = [...textPositionsRef.current];
    if (dragRef.current.mode === "move") {
      const { index, offsetX, offsetY } = dragRef.current;
      next[index] = {
        ...next[index],
        x: point.x - offsetX,
        y: point.y - offsetY,
      };
      setTextPositions(next);
      return;
    }

    const { index, startSize, startDist } = dragRef.current;
    const dist = Math.max(8, Math.hypot(point.x - next[index].x, point.y - next[index].y));
    const size = Math.min(200, Math.max(10, Math.round(startSize * (dist / startDist))));
    next[index] = { ...next[index], fontSize: size };
    setFontSize(size);
    setTextPositions(next);
  };

  const handleCanvasMouseUp = () => {
    dragRef.current = null;
  };

  const updateSelectedProp = (prop: keyof TextPosition, val: TextPosition[keyof TextPosition]) => {
    if (selectedIndex !== null && selectedIndex < textPositions.length) {
      pushHistory();
      const newPositions = [...textPositions];
      newPositions[selectedIndex] = { ...newPositions[selectedIndex], [prop]: val };
      setTextPositions(newPositions);
    }
  };

  const deleteSelectedPoint = () => {
    if (selectedIndex !== null && selectedIndex < textPositions.length) {
      pushHistory();
      setTextPositions(textPositions.filter((_, idx) => idx !== selectedIndex));
      setSelectedIndex(null);
    } else {
      alert("الرجاء الضغط على النص المطلوب حذفه داخل الصورة أولاً.");
    }
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleGenerate = async () => {
    if (!imageLoaded || !imageRef.current) {
      alert("الرجاء رفع الصورة الأساسية أولاً.");
      return;
    }

    const rows = getExportRows();
    if (rows.length === 0) {
      alert("أدخل بيانات عميل واحد في الحقول، أو استورد ملف Excel.");
      return;
    }
    if (textPositions.length === 0) {
      alert("الرجاء تحديد مكان نص واحد على الأقل بالنقر على الصورة.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsGenerating(true);

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageRef.current, 0, 0);

        textPositions.forEach((pos) => {
          const textVal = valueForLabel(pos.type, row);
          ctx.save();
          ctx.font = `bold ${pos.fontSize}px ${pos.fontFamily}`;
          if (pos.hasShadow) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
          }
          ctx.fillStyle = pos.fontColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(textVal), pos.x, pos.y);
          ctx.restore();
        });

        const clientName = sanitizeFileName(row.networkName || `عميل-${i + 1}`);
        const link = document.createElement("a");
        link.download = `${clientName}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        if (i < rows.length - 1) await sleep(350);
      }

      redrawCanvas();
      alert(`تم تصدير وتحميل ${rows.length} صورة باسم العميل بنجاح.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[980px] mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">محفظة جيب</h1>
        <h2 className="text-xl font-semibold text-gray-700">أداة دمج بيانات الشبكات على الصور</h2>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "templates"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          القوالب المتاحة
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("design")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "design"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          التصميم والتصدير
          {selectedTemplateId || imageLoaded ? (
            <span className="mr-2 text-[11px] font-normal text-emerald-600">● جاهز</span>
          ) : null}
        </button>
      </div>

      {activeTab === "templates" && (
        <div className="mb-2">
          <div className="bg-indigo-50 border-r-4 border-primary p-4 rounded-lg mb-5 text-sm">
            تصفّح القوالب الجاهزة، اختر القالب المميز، ثم أضف التعديلات في تبويب التصميم. يمكنك أيضاً رفع قالب من جهازك.
          </div>

          {(() => {
            const featured = READY_TEMPLATES.find((t) => t.id === previewTemplateId) || READY_TEMPLATES[0];
            return (
              <div className="mb-5 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 items-start">
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50/40 overflow-hidden">
                  <div className="px-4 py-2 flex items-center justify-between gap-2 bg-amber-100/70">
                    <span className="text-sm font-bold text-amber-900">
                      {featured.featured ? "⭐ قالب مميز — " : ""}
                      {featured.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectReadyTemplate(featured.id, featured.src)}
                      className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-hover"
                    >
                      استخدام هذا القالب
                    </button>
                  </div>
                  <img
                    src={featured.src}
                    alt={featured.label}
                    className="w-full max-h-[360px] object-contain bg-white"
                  />
                </div>

                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-xl bg-gray-50">
                    <label className="block text-sm font-semibold mb-2">اختيار قالب من مكان آخر</label>
                    <p className="text-xs text-gray-500 mb-3">ارفع صورة قالب من جهازك (JPG / PNG)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleImageUpload(e);
                        setActiveTab("design");
                      }}
                      className="w-full text-sm cursor-pointer"
                    />
                  </div>
                  {imageLoaded && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("design")}
                      className="w-full py-2.5 rounded-lg border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold text-sm"
                    >
                      متابعة التعديل على القالب الحالي ←
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          <label className="block font-semibold mb-3 text-sm">كل القوالب المتاحة ({READY_TEMPLATES.length})</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {READY_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setPreviewTemplateId(tpl.id)}
                onDoubleClick={() => handleSelectReadyTemplate(tpl.id, tpl.src)}
                className={`rounded-lg border-2 overflow-hidden bg-white text-right transition-all relative ${
                  previewTemplateId === tpl.id
                    ? "border-primary ring-2 ring-primary/30"
                    : selectedTemplateId === tpl.id
                      ? "border-emerald-500"
                      : "border-gray-200 hover:border-primary/50"
                }`}
              >
                {tpl.featured && (
                  <span className="absolute top-1 left-1 z-10 text-[10px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded">
                    مميز
                  </span>
                )}
                <img src={tpl.src} alt={tpl.label} className="w-full h-28 object-cover bg-gray-100" />
                <div className="px-2 py-1.5 text-xs font-semibold flex items-center justify-between gap-1">
                  <span>{tpl.label}</span>
                  {selectedTemplateId === tpl.id && <span className="text-emerald-600">✓</span>}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mb-4">نقرة واحدة للمعاينة — نقرتان أو زر «استخدام هذا القالب» للانتقال للتصميم.</p>
        </div>
      )}

      {activeTab === "design" && (
      <>
      <div className="bg-indigo-50 border-r-4 border-primary p-4 rounded-lg mb-6 text-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="font-semibold">التصميم الحالي: </strong>
          {selectedTemplateId
            ? READY_TEMPLATES.find((t) => t.id === selectedTemplateId)?.label || `قالب ${selectedTemplateId}`
            : imageLoaded
              ? "قالب مرفوع من الجهاز"
              : "لم يتم اختيار قالب بعد"}
        </div>
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className="text-xs font-semibold text-primary hover:underline"
        >
          تغيير القالب من التبويب
        </button>
      </div>

      {!imageLoaded && (
        <div className="mb-6 border-2 border-dashed border-amber-300 bg-amber-50 rounded-lg p-4 text-sm text-amber-900">
          اختر قالباً من تبويب <strong>القوالب المتاحة</strong> أولاً، أو ارفع قالباً من جهازك.
        </div>
      )}

      <div className="mb-6 border border-emerald-200 rounded-lg overflow-hidden">
        <div className="bg-emerald-50 px-4 py-2">
          <span className="text-sm font-semibold text-emerald-900">1. إدخال عميل واحد (بدون Excel)</span>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">اسم الشبكة</label>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="مثال: شبكه انترنت"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">رقم الكود</label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="مثال: 12345"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">رقم هاتف صاحب الشبكة</label>
            <input
              type="text"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              placeholder="مثال: 777465157"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        <p className="px-4 pb-3 text-xs text-gray-500">
          يكفي تعبئة هذه الحقول لعميل واحد. إذا رفعت Excel سيتم استخدام بيانات Excel بدل الإدخال اليدوي.
        </p>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2 text-sm">2. استيراد Excel (اختياري — لعدة عملاء)</label>
        <div className="border-2 border-dashed border-gray-300 p-3 rounded-lg bg-gray-50">
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleExcelUpload}
            className="w-full text-sm cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-2">
            الأعمدة: اسم الشبكة | رقم الكود | رقم صاحب الشبكة
          </p>
          <a
            href="/قالب-بيانات-الشبكات.xlsx"
            download
            className="inline-block mt-2 text-xs text-primary font-semibold hover:underline"
          >
            تحميل قالب Excel الجاهز (مع مثال)
          </a>
        </div>
      </div>

      {excelRows.length > 0 && (
        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm font-semibold">
              بيانات Excel ({excelRows.length} صف)
              {excelFileName ? ` — ${excelFileName}` : ""}
            </span>
            <button
              type="button"
              onClick={() => {
                setExcelRows([]);
                setExcelFileName("");
                if (excelInputRef.current) excelInputRef.current.value = "";
              }}
              className="text-xs text-red-600 hover:underline"
            >
              مسح البيانات
            </button>
          </div>
          <div className="max-h-56 overflow-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 font-semibold">#</th>
                  <th className="px-3 py-2 font-semibold">اسم الشبكة (العميل)</th>
                  <th className="px-3 py-2 font-semibold">رقم الكود</th>
                  <th className="px-3 py-2 font-semibold">رقم صاحب الشبكة</th>
                </tr>
              </thead>
              <tbody>
                {excelRows.map((row, idx) => (
                  <tr key={`${row.networkName}-${idx}`} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2">{row.networkName}</td>
                    <td className="px-3 py-2">{row.code}</td>
                    <td className="px-3 py-2">{row.ownerPhone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-gray-100 p-4 rounded-lg">
        <div>
          <label className="block text-xs font-semibold mb-1">حجم الخط (px):</label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 10;
              setFontSize(val);
              updateSelectedProp("fontSize", val);
            }}
            min="10"
            max="150"
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">لون الخط:</label>
          <input
            type="color"
            value={fontColor}
            onChange={(e) => {
              setFontColor(e.target.value);
              updateSelectedProp("fontColor", e.target.value);
            }}
            className="w-full h-10 p-1 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">نوع الخط:</label>
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              updateSelectedProp("fontFamily", e.target.value);
            }}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            {fontOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">تأثير ظل النص:</label>
          <select
            value={hasShadow ? "yes" : "no"}
            onChange={(e) => {
              const newVal = e.target.value === "yes";
              setHasShadow(newVal);
              updateSelectedProp("hasShadow", newVal);
            }}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="no">بدون ظل</option>
            <option value="yes">إضافة ظل بارز وقوي</option>
          </select>
        </div>
      </div>

      <div className="text-center mb-6">
        <label className="block font-semibold mb-3 text-right">3. حدد أماكن الليبلات على القالب:</label>

        <div className="flex justify-center gap-2 flex-wrap mb-4">
          <button
            type="button"
            onClick={() => setCurrentMode("اسم")}
            className={`px-3 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
              currentMode === "اسم"
                ? "bg-red-100 border-red-500 text-red-800"
                : "bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            اسم الشبكة
          </button>
          <button
            type="button"
            onClick={() => setCurrentMode("كود")}
            className={`px-3 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
              currentMode === "كود"
                ? "bg-blue-100 border-blue-500 text-blue-800"
                : "bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            رقم الكود
          </button>
          <button
            type="button"
            onClick={() => setCurrentMode("هاتف")}
            className={`px-3 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
              currentMode === "هاتف"
                ? "bg-emerald-100 border-emerald-500 text-emerald-800"
                : "bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            رقم صاحب الشبكة
          </button>
          <button
            type="button"
            onClick={deleteSelectedPoint}
            className="px-3 py-2 rounded-lg border-2 border-red-500 bg-red-100 text-red-800 font-semibold text-sm hover:bg-red-200 transition-all"
          >
            حذف الليبل المحدد
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-2 rounded-lg border-2 border-slate-400 bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Ctrl+Z"
          >
            تراجع Ctrl+Z
          </button>
          <button
            type="button"
            onClick={redo}
            className="px-3 py-2 rounded-lg border-2 border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
            title="Ctrl+Y"
          >
            إعادة Ctrl+Y
          </button>
        </div>

        {!imageLoaded ? (
          <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg bg-gray-50 text-gray-500">
            الرجاء اختيار صورة القالب لعرضها هنا
          </div>
        ) : (
          <div className="inline-block border-2 border-gray-300 rounded-lg bg-white p-2">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="max-w-full h-auto cursor-crosshair block"
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || !imageLoaded}
        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold text-base transition-colors"
      >
        {isGenerating ? "جاري التصدير والتنزيل..." : "تصدير وتنزيل الصور باسم العميل"}
      </button>
      </>
      )}
    </div>
  );
}
