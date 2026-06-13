-- 启用 pgvector 扩展
create extension if not exists vector;

-- 知识库 chunk 表（bge-m3 dense 向量 1024 维）
create table if not exists knowledge_chunks (
  id           uuid primary key default gen_random_uuid(),
  source       text not null,        -- 文件名，如 "健康教育.md"
  section_title text,                -- 章节标题
  content      text not null,        -- chunk 原文
  embedding    vector(1024),         -- bge-m3 dense embedding
  created_at   timestamptz default now()
);

-- IVFFlat 近似最近邻索引（cosine 相似度）
-- lists=10 适合 < 10k 行；如果后续文档超过 1 万 chunk，调整为 100
create index if not exists knowledge_chunks_embedding_idx
  on knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

-- RAG 检索函数，assistant route 直接 rpc 调用
create or replace function match_knowledge_chunks(
  query_embedding vector(1024),
  match_threshold float default 0.4,
  match_count     int   default 3
)
returns table (
  id            uuid,
  source        text,
  section_title text,
  content       text,
  similarity    float
)
language sql stable
as $$
  select
    id,
    source,
    section_title,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
