import { NextRequest, NextResponse } from "next/server";
import { parseTimesheetPDF } from "@/lib/timesheet-parser";

export async function POST(request: NextRequest) {
  console.log("[API Timesheet] Recebendo requisição...");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    console.log("[API Timesheet] Arquivo recebido:", file?.name || "null");

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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("[API Timesheet] Buffer size:", buffer.length);

    // Processar PDF
    const data = await parseTimesheetPDF(buffer);

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
    console.error("[API Timesheet] Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao processar o PDF",
      },
      { status: 500 }
    );
  }
}
