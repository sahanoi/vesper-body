import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
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
        .replace(/^-+|-+$/g, '') || 'urun';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Dosya seçilmedi.' },
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
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name).toLowerCase() || '.jpg';
      const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);

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
        // Fallback for read-only serverless environments (e.g. Vercel): return inline Data URL
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
