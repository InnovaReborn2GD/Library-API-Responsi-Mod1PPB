class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

function createResourceModel(supabase, table, orderField, select = '*') {
  return {
    async list(filters, page, limit) {
      let query = supabase.from(table).select(select).order(orderField, { ascending: false });
      for (const [field, value] of Object.entries(filters)) query = query.eq(field, value);
      const from = (page - 1) * limit;
      const { data, error } = await query.range(from, from + limit - 1);
      if (error) throw error;
      return data;
    },
    async findById(id) {
      const { data, error } = await supabase.from(table).select(select).eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async create(input) {
      const { data, error } = await supabase.from(table).insert(input).select(select).single();
      if (error) throw error;
      return data;
    },
    async update(id, input) {
      const { data, error } = await supabase.from(table).update(input).eq('id', id).select(select).maybeSingle();
      if (error) throw error;
      if (!data) throw new NotFoundError(table);
      return data;
    },
    async remove(id) {
      const { data, error } = await supabase.from(table).delete().eq('id', id).select('id').maybeSingle();
      if (error) throw error;
      if (!data) throw new NotFoundError(table);
    },
  };
}

module.exports = { NotFoundError, createResourceModel };
