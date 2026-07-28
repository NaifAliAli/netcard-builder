# نشر محفظة جيب على GitHub (حساب الشركة)

## الخطوة 1 — إنشاء المستودع

1. ادخل إلى **GitHub** بحساب الشركة (Organization)
2. **New repository**
3. الاسم المقترح: `netcard-builder` أو `mahfazat-jeeb`
4. **Public** (مطلوب لـ GitHub Pages المجاني)
5. Create repository

---

## الخطوة 2 — رفع الملفات

### الطريقة أ: عبر الموقع (أسهل)

1. في المستودع → **Add file** → **Upload files**
2. ارفع **كل محتويات مجلد `simple/`** إلى **جذر المستودع** (root):
   - `index.html`
   - `templates-base64.js`
   - `templates-manifest.js`
   - `fonts/` (المجلد كاملاً)
   - `mahfazat-jeeb-template.csv`
   - `.nojekyll`
3. ارفع أيضاً مجلد `.github/workflows/pages.yml` من المشروع (للنشر التلقائي)

> **مهم:** إذا رفعت محتويات `simple/` في جذر المستودع، عدّل ملف `pages.yml` ليكون `path: .` بدلاً من `path: simple`

### الطريقة ب: Git من جهازك

```bash
cd "d:\windsurf\NetCard Builder"
git init
git add simple/ .github/
git commit -m "Deploy NetCard Builder"
git remote add origin https://github.com/ORG-NAME/REPO-NAME.git
git branch -M main
git push -u origin main
```

---

## الخطوة 3 — تفعيل GitHub Pages

1. المستودع → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. بعد أول push، انتظر 1–3 دقائق
4. ارجع إلى **Settings → Pages** — ستجد الرابط

### الرابط العام

```
https://ORG-NAME.github.io/REPO-NAME/
```

مثال:
```
https://mycompany.github.io/netcard-builder/
```

---

## الخطوة 4 — رابط المشاركة (صفحة التصميم فقط)

أرسل للموظفين أو العملاء **هذا الرابط** (مع `#design`):

```
https://ORG-NAME.github.io/REPO-NAME/#design
```

| الرابط | ماذا يرى المستخدم |
|--------|-------------------|
| `.../` | التبويبان: القوالب + التصميم (للمدير) |
| `.../#design` | **صفحة التصميم فقط** — بدون تبويب القوالب |

بدائل تعمل أيضاً:
- `.../?design=1`
- `.../?view=design`

---

## الخطوة 5 — نسخ الرابط من التطبيق

بعد النشر، افتح التطبيق من الرابط → تبويب **القوالب** → اضغط **📋 نسخ الرابط** (يظهر تلقائياً عند الفتح عبر الإنترنت).

---

## إضافة قالب جديد لاحقاً

1. ضع الصورة في `templates/` (مثلاً `template10.png`)
2. شغّل: `powershell -ExecutionPolicy Bypass -File convert-templates.ps1`
3. ارفع التحديث إلى GitHub

---

## ملاحظات

- **Public repo** = أي شخص لديه الرابط يفتح التطبيق (لا يحتاج حساب GitHub)
- البيانات **لا تُرسل للخادم** — كل شيء في متصفح المستخدم
- للخصوصية أكثر: استخدم repo Private + GitHub Enterprise Pages (مدفوع) أو Netlify

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| 404 Not Found | انتظر 5 دقائق بعد أول deploy، أو تحقق من Settings → Pages |
| القوالب لا تظهر | تأكد من رفع `templates-base64.js` |
| Actions فشل | Settings → Actions → General → Allow all actions |
