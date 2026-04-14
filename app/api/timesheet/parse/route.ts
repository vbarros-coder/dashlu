import { NextRequest, NextResponse } from "next/server";
import { parseTimesheetPDF } from "@/lib/timesheet-parser";

export async function POST(request: NextRequest) {
  console.log("[API Timesheet] Recebendo requisição...");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    console.log("[API Timesheet] Arquivo recebido:", file?.name || "null", "Type:", file?.type);

    if (!file) {
      console.error("[API Timesheet] Nenhum arquivo enviado");
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      console.error("[API Timesheet] Arquivo não é PDF:", file.type);
      return NextResponse.json(
        { success: false, error: "O arquivo deve ser um PDF" },
        { status: 400 }
      );
    }

    // Converter File para Buffer
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
    } catch (e) {
      console.error("[API Timesheet] Erro ao ler arrayBuffer:", e);
      return NextResponse.json(
        { success: false, error: "Erro ao ler o arquivo. Tente novamente." },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(arrayBuffer);
    console.log("[API Timesheet] Buffer size:", buffer.length);

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Arquivo vazio" },
        { status: 400 }
      );
    }

    // Processar PDF
    let data;
    try {
      data = await parseTimesheetPDF(buffer);
    } catch (parseError) {
      console.error("[API Timesheet] Erro no parser:", parseError);
      const errorMsg = parseError instanceof Error ? parseError.message : "Erro ao processar PDF";
      return NextResponse.json(
        { success: false, error: `Erro no processamento: ${errorMsg}` },
        { status: 500 }
      );
    }

    console.log("[API Timesheet] Dados extraídos:", {
      resumoCount: data.resumoPorOperacao.length,
      itensCount: data.itensDetalhados.length,
      totalValor: data.totalGeral.valorTotal,
    });

    // Sempre retornar JSON válido com success
    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("[API Timesheet] Erro geral:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao processar o PDF",
      },
      { status: 500 }
    );
  }
}
