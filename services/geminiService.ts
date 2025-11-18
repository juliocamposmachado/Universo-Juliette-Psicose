import { GoogleGenAI, Type, Modality } from "@google/genai";

// This file no longer uses a single global API_KEY.
// The key is passed into each function from the corresponding module.

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

export const generateNarrative = async (apiKey: string, prompt: string, type: string): Promise<string> => {
  if (!apiKey) return "Erro: Chave de API não fornecida.";
  try {
    const ai = new GoogleGenAI({ apiKey });
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

export const generateArt = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) return "Erro: Chave de API não fornecida.";
  try {
    const ai = new GoogleGenAI({ apiKey });
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

export const generateCharacter = async (apiKey: string, prompt?: string): Promise<any> => {
  if (!apiKey) return null;
  try {
     const ai = new GoogleGenAI({ apiKey });
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

export const generateVideoSegment = async (
    apiKey: string,
    prompt: string, 
    referenceImage: string | null,
    onStatusUpdate: (status: string) => void
): Promise<string> => {
    if (!apiKey) {
      onStatusUpdate("Erro: Chave de API não fornecida.");
      throw new Error("API key is required.");
    }
    const videoAI = new GoogleGenAI({ apiKey });
    
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
        
        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
        if (!videoResponse.ok) {
            const errorBody = await videoResponse.text();
            throw new Error(`Falha ao baixar o vídeo: ${videoResponse.statusText} - ${errorBody}`);
        }
        
        const videoBlob = await videoResponse.blob();
        onStatusUpdate("Geração concluída!");
        return URL.createObjectURL(videoBlob);

    } catch (error: any) {
        console.error("Error generating video segment:", error);
        
        const errorMessage = error.message || '';
        if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
            const friendlyMessage = "Erro: Cota de uso da API excedida. Verifique seu plano e faturamento.";
            onStatusUpdate(friendlyMessage);
            throw new Error("QUOTA_EXCEEDED");
        }
        
        if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
             const friendlyMessage = "Erro: A chave de API fornecida é inválida.";
             onStatusUpdate(friendlyMessage);
             throw new Error("API_KEY_INVALID");
        }
        
        const friendlyMessage = `Falha ao gerar vídeo. Verifique o console para detalhes.`;
        onStatusUpdate(friendlyMessage);
        throw error;
    }
};

export const generateSound = async (
    apiKey: string,
    prompt: string,
    duration: '15s' | '30s' | '1 min' | '2 min' | '2 min+'
): Promise<string> => {
    if (!apiKey) return "";
    try {
        const ai = new GoogleGenAI({ apiKey });

        // Etapa 1: Gerar um roteiro com a duração apropriada
        let wordCount;
        switch (duration) {
            case '15s': wordCount = 40; break;
            case '30s': wordCount = 80; break;
            case '1 min': wordCount = 160; break;
            case '2 min': wordCount = 320; break;
            case '2 min+': wordCount = 450; break;
            default: wordCount = 40;
        }

        const scriptGenerationPrompt = `
            ${SAGA_STYLE_PROMPT}
            Com base na seguinte ideia para uma música/trilha sonora: "${prompt}", escreva um monólogo poético ou uma narrativa curta que capture essa essência.
            O texto deve ter aproximadamente ${wordCount} palavras para que, ao ser narrado, dure o tempo desejado.
            Não inclua títulos ou anotações, apenas o texto a ser falado.
        `;

        const scriptResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: scriptGenerationPrompt,
        });

        const scriptToNarrate = scriptResponse.text;
        if (!scriptToNarrate) {
            throw new Error("Falha ao gerar o roteiro para o áudio.");
        }

        // Etapa 2: Gerar áudio a partir do roteiro criado
        const audioResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: scriptToNarrate }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' }, // Uma voz versátil
                    },
                },
            },
        });

        const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }
        return "";

    } catch (error) {
        console.error("Error generating sound:", error);
        return "";
    }
};