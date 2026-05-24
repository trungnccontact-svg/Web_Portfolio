export interface KnowledgeChunk {
  id: string;
  title: string;
  category: string;
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: "chunk-1",
    title: "What is RAG (Retrieval-Augmented Generation)?",
    category: "RAG Architecture",
    content: "Retrieval-Augmented Generation (RAG) is a pattern that optimizes LLM output by querying an authoritative, external knowledge source (like a vector database) before generating a response. It has three core steps: Chunking/Indexing, Retrieval of top semantic matches, and Generation using context-augmented prompts."
  },
  {
    id: "chunk-2",
    title: "Dense vs. Sparse Retrieval in RAG",
    category: "RAG Architecture",
    content: "Dense retrieval uses deep learning models (bi-encoders) to generate dense vector embeddings (e.g. OpenAI text-embedding-3) and queries via cosine similarity. Sparse retrieval relies on exact keyword matching algorithms like TF-IDF or BM25, scoring relevance based on term frequency and document frequency. Hybrid search combines both."
  },
  {
    id: "chunk-3",
    title: "What is the BM25 Scoring Algorithm?",
    category: "Search & Retrieval",
    content: "BM25 (Best Matching 25) is a highly effective sparse retrieval ranking function. It estimates the relevance of a document chunk to a query by using term frequency (TF) and inverse document frequency (IDF) with saturation parameters (k1) and length normalization (b). It prevents long documents from unfairly dominating."
  },
  {
    id: "chunk-4",
    title: "Vector Databases: Pinecone, Qdrant, Milvus",
    category: "Vector Store",
    content: "Vector databases are specialized storage engines designed for high-dimensional float arrays (embeddings). They use Hierarchical Navigable Small World (HNSW) graphs, Inverted File Indexing (IVF), or Product Quantization (PQ) to achieve sub-millisecond approximate nearest neighbor (ANN) searches across millions of vectors."
  },
  {
    id: "chunk-5",
    title: "Evaluating RAG: Faithfulness Metric",
    category: "LLM Evaluation",
    content: "Faithfulness evaluates groundness: whether the LLM's generated response is strictly derived from the retrieved context chunks without hallucinating. It is mathematically measured by counting the proportion of generated statements that can be directly verified using facts in the retrieved documents."
  },
  {
    id: "chunk-6",
    title: "Evaluating RAG: Answer Relevance",
    category: "LLM Evaluation",
    content: "Answer Relevance evaluates focus: whether the generated answer addresses the user's core query directly or includes redundant, irrelevant information. High relevance means the answer answers exactly what was asked, without drifting into unrelated topics."
  },
  {
    id: "chunk-7",
    title: "LLM Agent ReAct (Reasoning and Acting) Pattern",
    category: "AI Agents",
    content: "The ReAct framework combines reasoning and acting in LLMs. The agent generates a 'Thought' explaining its analysis, decides on an 'Action' using an external tool (e.g. web_search, calculator), receives an 'Observation' (tool output), and repeats this loop recursively until it formulates a 'Final Answer'."
  },
  {
    id: "chunk-8",
    title: "Model Fine-Tuning: LoRA and QLoRA",
    category: "Fine-Tuning",
    content: "Low-Rank Adaptation (LoRA) speeds up LLM fine-tuning by freezing pre-trained weights and injecting small, rank-decomposition trainable matrices into self-attention layers. Quantized LoRA (QLoRA) goes further by compressing base model parameters to 4-bit NormalFloat (NF4), enabling massive 70B models to fine-tune on consumer GPUs."
  },
  {
    id: "chunk-9",
    title: "Approximate Nearest Neighbor (ANN) HNSW Graph",
    category: "Vector Store",
    content: "HNSW (Hierarchical Navigable Small World) is a state-of-the-art vector index structure. It represents vectors as nodes in multi-layered graphs. Top layers have long-distance edges for quick routing, while bottom layers have short-distance edges for fine precision, resembling skip-lists."
  },
  {
    id: "chunk-10",
    title: "Cosine Similarity vs Euclidean Distance",
    category: "Vector Store",
    content: "Cosine similarity measures the cosine of the angle between two high-dimensional vectors, evaluating direction alignment rather than length magnitude. Euclidean (L2) distance measures the straight-line distance between vector points. Cosine similarity is preferred in text search as it normalizes text length effects."
  },
  {
    id: "chunk-11",
    title: "Chunking Strategies for RAG Pipelines",
    category: "RAG Architecture",
    content: "Chunking splits long texts into small segments. Strategies include character-count chunking, recursive character chunking (splitting on paragraphs then sentences), and semantic chunking (using embedding shifts to detect topic boundaries). Chunks typically have an overlap (e.g. 10-20%) to preserve contextual transitions."
  },
  {
    id: "chunk-12",
    title: "Reranking in RAG (Cross-Encoders)",
    category: "RAG Architecture",
    content: "Retrieval can return irrelevant documents due to semantic drift. A Reranker (Cross-Encoder) evaluates the full query and document pair together, capturing deep interactions. It is slower but highly precise, re-ordering the top 25 chunks from the first-stage retriever to select the top 3 best fits."
  },
  {
    id: "chunk-13",
    title: "Prompt Engineering: Few-Shot vs Chain-of-Thought",
    category: "Prompt Engineering",
    content: "Few-Shot prompting provides the LLM with 2-3 input-output examples before the target query, conditioning its style and format. Chain-of-Thought (CoT) instructs the LLM to write out its step-by-step thinking processes (e.g. 'Let's think step by step') before outputting the final result, heavily reducing logical errors."
  },
  {
    id: "chunk-14",
    title: "RAG Evaluation: Context Recall Metric",
    category: "LLM Evaluation",
    content: "Context Recall measures the retriever's performance: whether the retriever successfully fetched all critical information required to answer the user query. It is evaluated by comparing the ground-truth answers against the retrieved context to ensure no essential details were missed."
  },
  {
    id: "chunk-15",
    title: "LangChain vs LlamaIndex for AI Applications",
    category: "AI Frameworks",
    content: "LangChain is a general-purpose framework for building chain-of-agent workflows, prompt chains, and tool-use pipelines. LlamaIndex is deeply specialized in data ingestion, indexing, and advanced RAG query engines, making it the preferred choice for heavy data-driven retrieval applications."
  },
  {
    id: "chunk-16",
    title: "Temperature and Top-P Parameters in LLMs",
    category: "Model Parameters",
    content: "Temperature controls randomness: values close to 0 make output highly deterministic and focused, while values near 1.0 enhance creativity and vocabulary variation. Top-P (nucleus sampling) limits the token selection pool to a cumulative probability threshold (e.g., top 90% of likely words), ensuring coherent creativity."
  },
  {
    id: "chunk-17",
    title: "Prompt Prefill and Prompt Caching",
    category: "Model Parameters",
    content: "Prompt Prefill is the latency phase where the LLM processes system prompts and history context before generating the first token. Prompt Caching stores compiled attention keys/values for recurrent prompt structures on the inference server, lowering prefill times by up to 90% for long chat histories."
  },
  {
    id: "chunk-18",
    title: "What are Vector Embeddings?",
    category: "Vector Store",
    content: "Vector embeddings represent text as high-dimensional float arrays (typically 384, 768, or 1536 elements). Deep learning neural models train on millions of texts to place words/paragraphs with similar concepts close together in semantic space, enabling meaning-based search rather than keyword search."
  },
  {
    id: "chunk-19",
    title: "The Cold Start Problem in AI Agents",
    category: "AI Agents",
    content: "The Cold Start problem in autonomous agent engineering refers to an agent failing its first step due to insufficient context, leading to infinite loop thoughts. Resolving this requires detailed priming prompts, robust error parsers, and default fallback options when tool outputs are blank or malformed."
  },
  {
    id: "chunk-20",
    title: "System Instructions (System Prompts)",
    category: "Prompt Engineering",
    content: "System instructions set the core rules, boundaries, style, and persona of the LLM. They operate with highest priority, establishing safety limits, formatting constraints (like forcing JSON), and specifying tone (professional, direct, concise), separating administrative commands from user inputs."
  }
];
