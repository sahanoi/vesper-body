import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  checkRateLimit,
  verifyAdminSessionFromRequest,
} from '@/lib/security';

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 35 * 1024 * 1024; // 35 MB
const MAX_FILES_PER_BATCH = 10;

export async function POST(req: NextRequest) {
  try {
    // 1. Require Verified Admin HttpOnly Session Cookie
    if (!verifyAdminSessionFromRequest(req)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Yetkisiz işlem (401): Dosya yüklemek için Yönetici girişi gereklidir.',
        },
        { status: 401 }
      );
    }

    // 2. Rate Limit Upload Requests
    const rl = checkRateLimit(req, 'admin_upload', 20, 5 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Çok fazla yükleme isteği gönderildi.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const slugRaw = (formData.get('slug') as string) || 'custom-product';

    const cleanSlug =
      slugRaw
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'urun';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Dosya seçilmedi.' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_BATCH) {
      return NextResponse.json(
        {
          ok: false,
          error: `Tek seferde en fazla ${MAX_FILES_PER_BATCH} dosya yüklenebilir.`,
        },
        { status: 400 }
      );
    }

    const uploadedMedia: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      alt: string;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.name).toLowerCase() || '.jpg';
      const isImage = ALLOWED_IMAGE_EXTS.includes(ext);
      const isVideo = ALLOWED_VIDEO_EXTS.includes(ext);

      // 3. Strict Whitelist Validation (Blocks .svg, .html, .js, .exe XSS/Shell uploads)
      if (!isImage && !isVideo) {
        return NextResponse.json(
          {
            ok: false,
            error: `Desteklenmeyen veya güvensiz dosya uzantısı (${ext}). Sadece JPG, PNG, WEBP, MP4 ve WEBM yüklenebilir.`,
          },
          { status: 400 }
        );
      }

      const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (file.size > maxBytes) {
        return NextResponse.json(
          {
            ok: false,
            error: `${file.name} dosya boyutu çok yüksek (Maksimum ${
              isVideo ? '35 MB' : '10 MB'
            }).`,
          },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const folderType = isVideo ? 'videos' : 'images';
      const timestamp = Date.now();
      const fileName = `${cleanSlug}-${timestamp}-${i + 1}${ext}`;

      try {
        const targetDir = path.join(
          process.cwd(),
          'public',
          folderType,
          'products',
          cleanSlug
        );

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, fileName);
        fs.writeFileSync(filePath, buffer);

        const publicUrl = `/${folderType}/products/${cleanSlug}/${fileName}`;
        uploadedMedia.push({
          id: `med-${timestamp}-${i}`,
          type: isVideo ? 'video' : 'image',
          url: publicUrl,
          alt: `${cleanSlug} - ${i + 1}`,
        });
      } catch {
        const mimeType =
          file.type || (isVideo ? 'video/mp4' : 'image/jpeg');
        const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
        uploadedMedia.push({
          id: `med-${timestamp}-${i}`,
          type: isVideo ? 'video' : 'image',
          url: dataUrl,
          alt: `${cleanSlug} - ${i + 1}`,
        });
      }
    }

    return NextResponse.json({ ok: true, media: uploadedMedia });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { ok: false, error: 'Dosya yükleme sırasında hata oluştu.' },
      { status: 500 }
    );
  }
}
