const { createResourceModel } = require('./resource');

function createModels(supabase) {
  return {
    member: createResourceModel(supabase, 'anggota', 'joined_at'),
    book: createResourceModel(supabase, 'buku', 'judul'),
    loan: createResourceModel(
      supabase,
      'peminjaman',
      'tanggal_peminjaman',
      '*, anggota(*), buku(*)',
    ),
  };
}

module.exports = { createModels };
