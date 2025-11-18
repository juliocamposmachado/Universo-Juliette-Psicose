import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd show a UI error. For this context, we'll log and throw.
  console.error("API_KEY environment variable not set.");
  // This will prevent the app from running without an API key.
  // In the target environment, process.env.API_KEY will be populated.
  // throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SAGA_STYLE_PROMPT = `
Você é a IA criativa do 'Universo Juliette Psicose'.
Seu estilo deve ser sempre:
- Surrealismo psicológico
- Focado em identidades duplas e múltiplas versões da personagem Juliette
- Atmosfera intensa, dramática e poética
- Toques de horror, existencialismo e metáforas profundas
- Temas de liberdade, verdade e rebelião
Mantenha essa essência em todas as suas criações.
`;

export const generateNarrative = async (prompt: string, type: string): Promise<string> => {
  try {
    const fullPrompt = `
      ${SAGA_STYLE_PROMPT}
      Gere um conteúdo de narrativa do tipo "${type}" com base na seguinte ideia: "${prompt}".
      Se for um roteiro, use o formato Final Draft.
      Se for um livro, estruture como um capítulo.
      Se for um gibi, descreva os painéis e diálogos.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: SAGA_STYLE_PROMPT,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating narrative:", error);
    return "Falha ao gerar narrativa. Verifique o console para mais detalhes.";
  }
};

export const generateArt = async (prompt: string): Promise<string> => {
  try {
    const fullPrompt = `
      Crie uma arte conceitual para o 'Universo Juliette Psicose'.
      Estilo: dark, surreal, cyberpunk, poético, com elementos de horror psicológico.
      Prompt: ${prompt}
    `;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return "";

  } catch (error) {
    console.error("Error generating art:", error);
    return "Falha ao gerar arte. Verifique o console para mais detalhes.";
  }
};

export const generateCharacter = async (prompt?: string): Promise<any> => {
  try {
     const generationPrompt = prompt
      ? `Com base na seguinte ideia: "${prompt}", gere uma nova ficha de personagem para o universo 'Juliette Psicose'. A ficha deve incluir uma de suas versões alternativas, poderes, psicologia complexa e contradições internas.`
      : "Gere uma nova ficha de personagem para o universo 'Juliette Psicose', incluindo uma de suas versões alternativas, poderes, psicologia complexa e contradições internas.";

     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: generationPrompt,
        config: {
            systemInstruction: SAGA_STYLE_PROMPT,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    version: { type: Type.STRING, description: "Ex: A Filósofa, A Guerreira, A Sombra" },
                    appearance: { type: Type.STRING },
                    personality: { type: Type.STRING },
                    psychology: { type: Type.STRING },
                    powers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    internalContradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    narrativeVoice: { type: Type.STRING }
                },
            },
        },
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Error generating character:", error);
    return null;
  }
};

// Nova função para gerar segmentos de vídeo
export const generateVideoSegment = async (
    prompt: string, 
    referenceImage: string | null,
    onStatusUpdate: (status: string) => void
): Promise<string> => {
    // A chave de API selecionada pelo usuário é injetada automaticamente.
    // Criamos uma nova instância para garantir que estamos usando a mais recente.
    const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fullPrompt = `${SAGA_STYLE_PROMPT}\nCrie uma cena de vídeo para o 'Universo Juliette Psicose'. Prompt: ${prompt}`;
    
    try {
        onStatusUpdate("Iniciando geração do vídeo...");
        
        let operation = await videoAI.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: fullPrompt,
            ...(referenceImage && {
                image: {
                    imageBytes: referenceImage.split(',')[1],
                    mimeType: 'image/jpeg',
                },
            }),
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        onStatusUpdate("Processando no servidor... Isso pode levar alguns minutos.");

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Espera 10 segundos
            operation = await videoAI.operations.getVideosOperation({ operation: operation });
            onStatusUpdate(`Progresso: ${operation.metadata?.progressPercentage?.toFixed(0) ?? '...'}%`);
        }

        onStatusUpdate("Download do vídeo...");
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Link para download do vídeo não encontrado.");
        }
        
        // A chave de API é necessária para o download
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            const errorBody = await videoResponse.text();
            throw new Error(`Falha ao baixar o vídeo: ${videoResponse.statusText} - ${errorBody}`);
        }
        
        const videoBlob = await videoResponse.blob();
        onStatusUpdate("Geração concluída!");
        return URL.createObjectURL(videoBlob);

    } catch (error: any) {
        console.error("Error generating video segment:", error);
        
        // Check for quota exceeded error first.
        if (error.message && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"))) {
            const friendlyMessage = "Erro: Cota de uso da API excedida. Verifique seu plano e faturamento.";
            onStatusUpdate(friendlyMessage);
            throw new Error("QUOTA_EXCEEDED");
        }
        
        // Check for invalid API key
        if (error.message && error.message.includes("Requested entity was not found.")) {
             const friendlyMessage = "Erro: A chave de API pode ser inválida. Tente selecionar outra.";
             onStatusUpdate(friendlyMessage);
             throw new Error("API_KEY_NOT_FOUND");
        }
        
        // For any other error
        const friendlyMessage = `Falha ao gerar vídeo. Verifique o console para detalhes.`;
        onStatusUpdate(friendlyMessage);
        throw error; // Re-throw the original error
    }
};