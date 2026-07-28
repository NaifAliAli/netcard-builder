# محفظة جيب — نسخة الويب (Production)

هذا المجلد للنشر على الإنترنت.

## الرابط الرسمي
https://naifaliali.github.io/netcard-builder/#design

## تحديث المجلد
```powershell
cd web
.\prepare-web.ps1
```

## القوالب
- **معرض القوالب:** `templates-thumbs.js` (مدمج مع الموقع)
- **صورة كاملة:** تُحمّل من GitHub مباشرة (بدون VPN)
- **نسخة احتياطية:** `templates-data/` عند فشل التحميل

## بدون VPN
إذا `github.io` محجوب، انشر على Vercel:
https://vercel.com/new/clone?repository-url=https://github.com/NaifAliAli/netcard-builder
Root Directory: `web`
