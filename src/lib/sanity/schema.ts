/**
 * Sanity.io CMS & Tek Çatı E-Ticaret Şema Tanımları
 * Not: Bu şema hem gömülü /admin paneli hem de Sanity Studio (Free Tier) ile %100 uyumludur.
 */

export const sanityProductSchema = {
  name: 'product',
  title: 'Ürünler (İç Giyim & Fantezi Koleksiyonu)',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Ürün Adı (Örn: Sofia Tül Balkonet Takım)',
      type: 'string',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL Kısaltması (Slug)',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
    },
    {
      name: 'subtitle',
      title: 'Kısa Alt Başlık (Örn: Fransız Dantelli & Balenli Set)',
      type: 'string',
    },
    {
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: 'Sütyen Takımları & Balkonet', value: 'sutyen-takimlari' },
          { title: 'Büstiyer & Korse Setleri', value: 'bustiyer-korse' },
          { title: 'Jartiyer Takımları', value: 'jartiyer-setleri' },
          { title: 'Babydoll, Gecelik & Saten Elbise', value: 'babydoll-gecelik' },
          { title: 'Bodysuit & Tulum', value: 'bodysuit-tulum' },
          { title: 'Vücut Çorapları & Aksesuar', value: 'vucut-coraplari' },
        ],
      },
    },
    {
      name: 'spiceLevel',
      title: 'Stil / Cesaret Derecesi (Naughty Touch)',
      type: 'string',
      options: {
        list: [
          { title: '🌸 Romantik & Zarif (Romantic)', value: 'romantic' },
          { title: '🔥 Çekici & İddialı (Seductive)', value: 'seductive' },
          { title: '🖤 Cesur & Fantezi (After Dark / Daring)', value: 'daring' },
        ],
      },
    },
    {
      name: 'price',
      title: 'Satış Fiyatı (TL)',
      type: 'number',
    },
    {
      name: 'compareAtPrice',
      title: 'İndirim Öncesi Fiyat (TL - Opsiyonel)',
      type: 'number',
    },
    {
      name: 'isAfterDarkExclusive',
      title: 'Gece Modu (After Dark) Öne Çıkan Ürünü mü?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'media',
      title: 'Görsel ve Hareketli Video (GIF Loop) Galerisi',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Medya Tipi',
              type: 'string',
              options: {
                list: [
                  { title: 'Fotoğraf (Yüksek Çözünürlük)', value: 'image' },
                  { title: 'Hareketli Video Loop (MP4/WebM - GIF Alternatifi)', value: 'video' },
                ],
              },
            },
            { name: 'url', title: 'Medya URL / Dosya', type: 'url' },
            { name: 'posterUrl', title: 'Video Kapak Görseli', type: 'url' },
            { name: 'alt', title: 'Alternatif Metin (SEO)', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'variants',
      title: 'Beden ve Stok Varyantları',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'size', title: 'Beden (XS, S, M, L, XL)', type: 'string' },
            { name: 'sku', title: 'Stok Kodu (SKU)', type: 'string' },
            { name: 'stock', title: 'Stok Adedi', type: 'number' },
          ],
        },
      ],
    },
  ],
};

